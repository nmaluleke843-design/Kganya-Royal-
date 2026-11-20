import React, { useMemo, useState } from 'react'

const categories = ['All events', 'Music', 'Food & drink', 'Markets', 'Arts & culture', 'Outdoors']
const areas = ['All Gauteng', 'Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Centurion']
const artwork = {
  Music: 'music-art',
  'Food & drink': 'food-art',
  Markets: 'market-art',
  'Arts & culture': 'art-art',
  Outdoors: 'outdoor-art',
}
const icons = {
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  heart: <path d="M20.8 8.8c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.8 4.8 0 0 1 8.8-2.7 4.8 4.8 0 0 1 8.8 2.7Z"/>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
}
function Icon({ name, size = 18, fill = 'none' }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>
}

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
function dateAt(offset) {
  const d = new Date()
  d.setHours(18, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d
}
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function formatRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth()
  const monthA = start.toLocaleDateString('en-ZA', { month: 'long' })
  const monthB = end.toLocaleDateString('en-ZA', { month: 'long' })
  return sameMonth ? `${monthA} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}` : `${monthA} ${start.getDate()} – ${monthB} ${end.getDate()}, ${end.getFullYear()}`
}
const seedEvents = [
  { id: 'e1', title: 'Sunday Soul Sessions', category: 'Music', area: 'Johannesburg', venue: 'Victoria Yards', time: '14:00 – 20:00', price: 'From R120', offset: 2, tag: 'GOOD VIBES', description: 'An open-air afternoon of live soul, local DJs and good food in the heart of the city.' },
  { id: 'e2', title: 'Neighbourgoods Market', category: 'Markets', area: 'Johannesburg', venue: 'The Playground, Braamfontein', time: '09:00 – 15:00', price: 'Free entry', offset: 1, tag: 'LOCAL FAVOURITE', description: 'Find handmade goods, independent designers and delicious street food under one roof.' },
  { id: 'e3', title: 'First Thursdays: City Walk', category: 'Arts & culture', area: 'Johannesburg', venue: 'Rosebank Art Mile', time: '17:00 – 21:00', price: 'Free entry', offset: 5, tag: 'ARTS & CULTURE', description: 'Wander between galleries, pop-up exhibitions and late-night creative spaces.' },
  { id: 'e4', title: 'Pretoria Park Run & Picnic', category: 'Outdoors', area: 'Pretoria', venue: 'Magnolia Dell', time: '08:00 – 12:00', price: 'Free', offset: 6, tag: 'GET OUTSIDE', description: 'Start the morning with a relaxed community run, then stay for a picnic on the lawns.' },
  { id: 'e5', title: 'Maboneng Food & Wine Fest', category: 'Food & drink', area: 'Johannesburg', venue: 'Fox Street, Maboneng', time: '12:00 – 19:00', price: 'From R80', offset: 3, tag: 'TASTE GAUTENG', description: 'A lively street-food celebration featuring local chefs, small-batch makers and live music.' },
  { id: 'e6', title: 'Jazz on the Lawn', category: 'Music', area: 'Pretoria', venue: 'Union Buildings Gardens', time: '15:00 – 19:00', price: 'From R150', offset: 4, tag: 'LIVE MUSIC', description: 'Bring a blanket and settle in for an easy-going afternoon of South African jazz.' },
  { id: 'e7', title: 'Sandton Makers Market', category: 'Markets', area: 'Sandton', venue: 'Nelson Mandela Square', time: '10:00 – 16:00', price: 'Free entry', offset: 0, tag: 'SHOP LOCAL', description: 'Meet Gauteng makers and browse ceramics, art, homeware and gifts.' },
  { id: 'e8', title: 'Soweto Sunday Brunch', category: 'Food & drink', area: 'Soweto', venue: 'Vilakazi Street', time: '11:00 – 16:00', price: 'From R180', offset: 7, tag: 'SUNDAY PLANS', description: 'A neighbourhood brunch with local flavours, music and warm Soweto hospitality.' },
]
const defaultDate = dateKey(startOfWeek(new Date()))

export default function App() {
  const [events, setEvents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gauteng-events-added') || '[]')
      return [...saved, ...seedEvents.map(event => ({ ...event, date: dateKey(dateAt(event.offset)) }))]
    } catch { return seedEvents.map(event => ({ ...event, date: dateKey(dateAt(event.offset)) })) }
  })
  const [category, setCategory] = useState('All events')
  const [area, setArea] = useState('All Gauteng')
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('gauteng-events-saved') || '[]') } catch { return [] } })
  const [showSaved, setShowSaved] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const weekStart = useMemo(() => startOfWeek(new Date()), [])
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })
  const visibleEvents = events.filter(event => {
    const query = search.trim().toLowerCase()
    return (!selectedDate || event.date === selectedDate)
      && (category === 'All events' || event.category === category)
      && (area === 'All Gauteng' || event.area === area)
      && (!showSaved || saved.includes(event.id))
      && (!query || `${event.title} ${event.venue} ${event.area} ${event.category}`.toLowerCase().includes(query))
      && event.date >= dateKey(weekStart) && event.date <= dateKey(weekEnd)
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  function toggleSaved(id) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('gauteng-events-saved', JSON.stringify(next))
  }
  function addEvent(event) {
    const next = [event, ...events]
    setEvents(next)
    const userEvents = next.filter(item => item.custom)
    localStorage.setItem('gauteng-events-added', JSON.stringify(userEvents))
    setShowForm(false)
    setToast('Your event has been added to this week.')
    window.setTimeout(() => setToast(''), 3500)
  }
  function resetFilters() {
    setCategory('All events'); setArea('All Gauteng'); setSearch(''); setSelectedDate(''); setShowSaved(false)
  }

  return <div className="app-shell">
    <div className="announcement"><span className="live-dot"/> YOUR WEEK, WELL SPENT <span className="announcement-divider">·</span> THE BEST OF GAUTENG, IN ONE PLACE</div>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Weekender home"><span className="brand-mark">w.</span><span>weekender<span className="brand-dot">.</span><small>GAUTENG, SOUTH AFRICA</small></span></a>
      <nav className="header-nav" aria-label="Main navigation"><a className="active" href="#events">Discover</a><a href="#week">This week</a><button className={showSaved ? 'nav-saved active' : 'nav-saved'} onClick={() => {setShowSaved(!showSaved); setSelectedDate('')}}><Icon name="heart" size={16}/> Saved <span className="saved-count">{saved.length}</span></button></nav>
      <button className="add-event-button" onClick={() => setShowForm(true)}><Icon name="plus" size={17}/> Add an event</button>
    </header>
    <main id="home">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span/> THE GAUTENG WEEKLY EDIT</div><h1>Make a week<br/>of <em>it.</em></h1><p>Good things are happening around the corner. Find your next gig, market, meal or little escape.</p><a className="hero-link" href="#events">Find your next plan <Icon name="arrow" size={17}/></a></div>
        <div className="hero-art" aria-label="Illustration of the Johannesburg skyline"><div className="sun-disc"/><div className="hero-caption"><span>26° 12′ S</span><i/> <span>28° 02′ E</span><b>JOHANNESBURG, GAUTENG</b></div><div className="skyline"><div className="building building-one"><i/><i/><i/><i/></div><div className="building building-two"><i/><i/><i/><i/><i/><i/></div><div className="building building-three"><i/><i/><i/></div><div className="building building-four"><i/><i/><i/><i/><i/></div><div className="building building-five"><i/><i/><i/><i/></div><div className="hill hill-one"/><div className="hill hill-two"/></div><div className="hero-stamp">YOUR<br/>CITY,<br/><em>IN PLAY.</em></div></div>
        <div className="hero-bottom"><span>CURATED FOR YOUR CORNER OF THE WORLD</span><span>JOBURG · PRETORIA · EVERYWHERE IN BETWEEN <b>↘</b></span></div>
      </section>
      <section className="week-section" id="week"><div className="week-title"><div><div className="section-kicker">PICK YOUR MOMENT</div><h2>The week ahead<span>.</span></h2></div><div className="week-dates"><Icon name="calendar" size={17}/>{formatRange(weekStart, weekEnd)}<span className="timezone">SAST</span></div></div>
        <div className="day-strip" aria-label="Filter by day"><button className={!selectedDate ? 'day-item selected' : 'day-item'} onClick={() => setSelectedDate('')}><span>ALL WEEK</span><b><Icon name="arrow" size={16}/></b><small>{events.filter(e => e.date >= dateKey(weekStart) && e.date <= dateKey(weekEnd)).length} PLANS</small></button>{days.map((day, i) => {const key = dateKey(day); const count = events.filter(e => e.date === key).length; return <button key={key} className={selectedDate === key ? 'day-item selected' : 'day-item'} onClick={() => setSelectedDate(selectedDate === key ? '' : key)}><span>{day.toLocaleDateString('en-ZA', {weekday:'short'}).toUpperCase()}</span><b>{String(day.getDate()).padStart(2,'0')}</b><small>{count ? `${count} ${count === 1 ? 'PLAN' : 'PLANS'}` : 'EXPLORE'}</small></button>})}</div>
      </section>
      <section className="discover-section" id="events"><div className="discover-heading"><div><div className="section-kicker">OUT THERE THIS WEEK</div><h2>{showSaved ? 'Your shortlist' : 'Find your thing'}<span>.</span></h2></div><p>Little plans make the best stories.</p></div>
        <div className="filter-bar"><label className="search-box"><Icon name="search" size={19}/><input aria-label="Search events" placeholder="Try ‘jazz’, ‘market’, ‘Pretoria’..." value={search} onChange={e => setSearch(e.target.value)}/><kbd>⌘ K</kbd></label><label className="select-wrap"><Icon name="pin" size={17}/><select aria-label="Filter by area" value={area} onChange={e => setArea(e.target.value)}>{areas.map(item => <option key={item}>{item}</option>)}</select><Icon name="chevron" size={15}/></label></div>
        <div className="category-row" aria-label="Filter by category">{categories.map(item => <button key={item} className={category === item ? 'category-chip chosen' : 'category-chip'} onClick={() => setCategory(item)}>{item === 'All events' && <span className="chip-star">✳</span>}{item}</button>)}<span className="results-count">{visibleEvents.length} {visibleEvents.length === 1 ? 'EVENT' : 'EVENTS'}</span></div>
        {visibleEvents.length ? <div className="event-grid">{visibleEvents.map((event, index) => <article className={`event-card ${index === 0 ? 'featured-card' : ''}`} key={event.id}><div className={`event-art ${artwork[event.category] || 'music-art'}`}><span className="event-tag">{event.tag || event.category.toUpperCase()}</span><div className="art-graphic"><span className="art-shape shape-one"/><span className="art-shape shape-two"/><span className="art-shape shape-three"/><span className="art-type">{event.category === 'Music' ? 'SOUND\nCHECK' : event.category === 'Markets' ? 'GOOD\nFINDS' : event.category === 'Food & drink' ? 'COME\nHUNGRY' : event.category === 'Outdoors' ? 'FRESH\nAIR' : 'LOOK\nCLOSER'}</span></div><button className={saved.includes(event.id) ? 'heart-button is-saved' : 'heart-button'} aria-label={saved.includes(event.id) ? 'Remove from saved events' : 'Save event'} onClick={() => toggleSaved(event.id)}><Icon name="heart" size={18} fill={saved.includes(event.id) ? 'currentColor' : 'none'}/></button><div className="art-index">WK / {String(index + 1).padStart(2,'0')}</div></div><div className="event-info"><div className="event-date-line"><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'}).toUpperCase()}</span><i/> {event.time}</div><h3>{event.title}</h3><div className="event-location"><Icon name="pin" size={15}/><span>{event.venue}, {event.area}</span></div><p className="event-description">{event.description}</p><div className="event-card-foot"><span>{event.price}</span><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.area}, Gauteng`)}`} aria-label={`View ${event.venue} on map`}>GET DIRECTIONS <Icon name="arrow" size={15}/></a></div></div></article>)}</div> : <div className="empty-state"><span>✳</span><h3>{showSaved ? 'Your shortlist is waiting.' : 'No plans found. Yet.'}</h3><p>{showSaved ? 'Tap the heart on an event to keep it close.' : 'Try another day, area or category and see what turns up.'}</p><button onClick={resetFilters}>Show me everything <Icon name="arrow" size={16}/></button></div>}
        <div className="listing-note"><span>*</span> Event details can change. Check with the organiser before heading out.</div>
      </section>
      <section className="submit-banner"><div className="submit-spark">✳</div><div><div className="section-kicker">GOT SOMETHING GOOD?</div><h2>Your event belongs <em>here.</em></h2><p>Help more people find the good stuff happening in Gauteng.</p></div><button onClick={() => setShowForm(true)}>List your event <Icon name="arrow" size={17}/></button><span className="banner-doodle">GAUTENG<br/>GOES OUT ↗</span></section>
    </main>
    <footer><a className="footer-brand" href="#home">weekender<span>.</span></a><span>MADE FOR THE IN-BETWEEN PLANS.</span><span>© {new Date().getFullYear()} WEEKENDER GAUTENG</span><a href="#home">BACK TO TOP ↑</a></footer>
    {showForm && <EventForm onClose={() => setShowForm(false)} onSubmit={addEvent}/>}
    {toast && <div role="status" className="toast">✳ &nbsp;{toast}</div>}
  </div>
}

function EventForm({ onClose, onSubmit }) {
  function submit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const venue = form.get('venue')
    const event = { id: `custom-${Date.now()}`, title: form.get('title'), category: form.get('category'), area: form.get('area'), venue, time: form.get('time'), price: form.get('price') || 'See organiser', date: form.get('date'), tag: 'COMMUNITY PICK', description: form.get('description') || 'A great local event happening in Gauteng.', custom: true }
    onSubmit(event)
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="event-modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><button className="modal-close" onClick={onClose} aria-label="Close">×</button><div className="section-kicker">GIVE YOUR PLANS A PLACE</div><h2 id="form-title">List an event<span>.</span></h2><p className="modal-intro">Share something happening around Gauteng this week.</p><form onSubmit={submit}><label>Event name<input name="title" required maxLength="70" placeholder="e.g. Rooftop Sessions"/></label><div className="form-two"><label>Category<select name="category">{categories.slice(1).map(item=><option key={item}>{item}</option>)}</select></label><label>Area<select name="area">{areas.slice(1).map(item=><option key={item}>{item}</option>)}</select></label></div><label>Venue<input name="venue" required placeholder="Venue or street address"/></label><div className="form-two"><label>Date<input name="date" type="date" min={dateKey(new Date())} max={dateKey(dateAt(6))} defaultValue={defaultDate} required/></label><label>Time<input name="time" required placeholder="e.g. 18:00 – 22:00"/></label></div><div className="form-two"><label>Price<input name="price" placeholder="e.g. Free entry"/></label><label>What to expect<input name="description" placeholder="A short description"/></label></div><button className="submit-event" type="submit">Add to this week <Icon name="arrow" size={17}/></button><small className="form-disclaimer">Demo listing is saved in this browser only.</small></form></section></div>
}
