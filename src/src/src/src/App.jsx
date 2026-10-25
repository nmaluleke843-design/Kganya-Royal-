import React, { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const BIZ = {
  phone: '076 856 0303', email: 'royalfuneralservice@gmail.com',
  address: 'A 52, 9th Avenue, close to Mountain Hill Road, Praktiseer, Burgersfort, Limpopo, 1150',
  hours: 'Mon–Fri 08:00–17:00 · Sat 08:00–13:00 · Sun by appointment',
}
const PACKAGES = ['Basic cover', 'Family cover', 'Extended family cover', 'Cash payout cover']
const PAGES = [['home','Home'],['apply','Apply'],['claims','Claims'],['catering','Catering'],['tombstones','Tombstones'],['track','Track status'],['contact','Contact'],['admin','Staff login']]

function Form({ table, fields, submit, intro }) {
  const [state, setState] = useState({ busy: false })
  async function onSubmit(e) {
    e.preventDefault()
    const form = e.target
    const data = Object.fromEntries(new FormData(form).entries())
    Object.keys(data).forEach(k => data[k] === '' && delete data[k])
    setState({ busy: true })
    const { data: row, error } = await supabase.from(table).insert(data).select('reference').maybeSingle()
    if (error && !/select|permission|policy/i.test(error.message)) return setState({ error: error.message })
    setState({ done: true, ref: row?.reference })
    form.reset()
  }
  return (
    <div className="wrap"><section>
      {intro}
      <form onSubmit={onSubmit}>
        {fields.map(([name, label, type = 'text', opts]) => (
          <label key={name}>{label}
            {type === 'textarea' ? <textarea name={name} rows="3" /> :
             type === 'select' ? <select name={name} required>{opts.map(o => <option key={o}>{o}</option>)}</select> :
             <input name={name} type={type} required={!/\(optional\)/.test(label)} />}
          </label>
        ))}
        <button className="btn" disabled={state.busy}>{state.busy ? 'Sending…' : submit}</button>
        {state.done && <div className="msg ok">Thank you. We have received your request and will contact you shortly.{state.ref && <> Your reference number is <b>{state.ref}</b>.</>}</div>}
        {state.error && <div className="msg err">Could not send: {state.error}. Please try again or call {BIZ.phone}.</div>}
      </form>
    </section></div>
  )
}

function Track() {
  const [ref, setRef] = useState(''); const [res, setRes] = useState(null)
  async function lookup(e) {
    e.preventDefault()
    const { data, error } = await supabase.rpc('track_status', { ref: ref.trim() })
    setRes(error ? { error: error.message } : data)
  }
  return (
    <div className="wrap"><section>
      <h2>Track your request</h2><p>Enter the reference number you received when you applied.</p>
      <form onSubmit={lookup}>
        <label>Reference number<input value={ref} onChange={e => setRef(e.target.value)} required /></label>
        <button className="btn">Check status</button>
        {res?.error && <div className="msg err">{res.error}</div>}
        {Array.isArray(res) && !res.length && <div className="msg err">No request found with that reference.</div>}
        {Array.isArray(res) && res.map((r, i) => <div className="msg ok" key={i}>Your {r.kind} is <b>{r.status.replace('_',' ')}</b> (submitted {new Date(r.created_at).toLocaleDateString()}).</div>)}
      </form>
    </section></div>
  )
}

const TABLES = ['applications', 'claims', 'catering_requests', 'tombstone_enquiries', 'contact_messages']
function Admin() {
  const [session, setSession] = useState(null); const [tab, setTab] = useState(TABLES[0])
  const [rows, setRows] = useState([]); const [err, setErr] = useState('')
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  const load = async () => {
    const { data, error } = await supabase.from(tab).select('*').order('created_at', { ascending: false })
    setErr(error ? error.message : ''); setRows(data || [])
  }
  useEffect(() => { if (session) load() }, [session, tab])
  async function login(e) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target))
    const { error } = await supabase.auth.signInWithPassword(f)
    if (error) setErr(error.message)
  }
  async function setStatus(id, status) { await supabase.from(tab).update({ status }).eq('id', id); load() }
  if (!session) return (
    <div className="wrap"><section><h2>Staff login</h2>
      <form onSubmit={login}>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button className="btn">Log in</button>{err && <div className="msg err">{err}</div>}
      </form></section></div>)
  const cols = rows[0] ? Object.keys(rows[0]).filter(k => k !== 'id') : []
  return (
    <div className="wrap"><section>
      <h2>Staff dashboard</h2>
      <p>{TABLES.map(t => <button key={t} className={'btn' + (t === tab ? '' : ' ghost')} style={t === tab ? {} : { color: '#1B3A6B', borderColor: '#1B3A6B' }} onClick={() => setTab(t)}>{t.replace('_', ' ')}</button>)}
        <button className="btn ghost" style={{ color: '#1B3A6B', borderColor: '#1B3A6B' }} onClick={() => supabase.auth.signOut()}>Log out</button></p>
      {err && <div className="msg err">{err}. If this says no permission, your account needs the admin role.</div>}
      <div className="scroll"><table><thead><tr>{cols.map(c => <th key={c}>{c.replace('_', ' ')}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r.id}>{cols.map(c => <td key={c}>
          {c === 'status' && 'status' in r ? <select value={r.status} onChange={e => setStatus(r.id, e.target.value)}>{['received','in_review','approved','paid','declined'].map(s => <option key={s}>{s}</option>)}</select> : String(r[c] ?? '')}
        </td>)}</tr>)}</tbody></table></div>
      {!rows.length && !err && <p>Nothing here yet. New submissions will appear in this list.</p>}
    </section></div>)
}

export default function App() {
  const [page, setPage] = useState(location.hash.slice(1) || 'home')
  const go = p => { location.hash = p; setPage(p); scrollTo(0, 0) }
  useEffect(() => { const h = () => setPage(location.hash.slice(1) || 'home'); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  const Intro = ({ t, p }) => <><h2>{t}</h2><p>{p}</p></>

  return (<>
    <div className="top">{BIZ.phone} · {BIZ.hours}</div>
    <nav><div className="wrap"><b>Kganya Royal Funeral Services</b>
      {PAGES.map(([k, l]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}
    </div></nav>

    {page === 'home' && <>
      <div className="hero"><div className="wrap">
        <h1>Dignified farewells, honoured with royal care</h1>
        <p>Funeral cover, premium tombstones, catering and claims support for families in Burgersfort and across Limpopo.</p>
        <button className="btn" onClick={() => go('apply')}>Get funeral cover</button>
        <button className="btn ghost" onClick={() => go('claims')}>Submit a claim</button>
      </div></div>
      <div className="wrap"><section><h2>What we offer</h2><div className="grid">
        {[['apply','Funeral cover','Packages for you and your dependants.'],['claims','Claims support','Submit a claim and follow its progress.'],['catering','Catering','Meals for funerals, memorials and gatherings.'],['tombstones','Tombstones','Granite, marble and custom memorials.']]
          .map(([k, t, d]) => <button key={k} className="card" onClick={() => go(k)}><h3>{t}</h3><p>{d}</p></button>)}
      </div></section></div></>}

    {page === 'apply' && <Form table="applications" submit="Submit application" intro={<Intro t="Apply for funeral cover" p="Complete the form and our team will review your application and confirm your cover." />}
      fields={[['full_name','Full name'],['id_number','ID number'],['phone','Phone number','tel'],['email','Email (optional)','email'],['address','Home address (optional)'],['package','Cover package','select',PACKAGES],['dependants','Dependants: names and ages (optional)','textarea']]} />}
    {page === 'claims' && <Form table="claims" submit="Submit claim" intro={<Intro t="Submit a claim" p="We are sorry for your loss. Share the details below and a claims consultant will call you." />}
      fields={[['policy_holder','Policy holder name'],['deceased_name','Name of the deceased'],['phone','Contact number','tel'],['date_of_death','Date of death (optional)','date'],['notes','Anything else we should know (optional)','textarea']]} />}
    {page === 'catering' && <Form table="catering_requests" submit="Request catering" intro={<Intro t="Request catering" p="Tell us about the gathering and we will send you a quote." />}
      fields={[['full_name','Full name'],['phone','Contact number','tel'],['event_date','Event date (optional)','date'],['guests','Number of guests (optional)','number'],['package','Package (optional)'],['notes','Notes (optional)','textarea']]} />}
    {page === 'tombstones' && <Form table="tombstone_enquiries" submit="Send enquiry" intro={<Intro t="Tombstone enquiry" p="Tell us what you have in mind and we will contact you with options and a quote." />}
      fields={[['full_name','Full name'],['phone','Contact number','tel'],['material','Material (optional)','select',['Granite','Marble','Custom']],['engraving','Engraving wording (optional)','textarea'],['notes','Notes (optional)','textarea']]} />}
    {page === 'contact' && <Form table="contact_messages" submit="Send message" intro={<Intro t="Contact us" p={`${BIZ.address}. Call ${BIZ.phone} or email ${BIZ.email}.`} />}
      fields={[['full_name','Your name'],['phone','Phone (optional)','tel'],['email','Email (optional)','email'],['message','Message','textarea']]} />}
    {page === 'track' && <Track />}
    {page === 'admin' && <Admin />}

    <footer><div className="wrap">
      <p><b>Kganya Royal Funeral Services</b><br />{BIZ.address}<br />{BIZ.phone} · {BIZ.email}</p>
      <p className="note">Terms, waiting periods and eligibility apply. Insurance and financial services require the appropriate regulatory and underwriting setup before production use.</p>
    </div></footer>
  </>)
}
