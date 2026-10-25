# Kganya Royal Funeral Services

React + Vite front end, Supabase (database, auth, row-level security), GitHub Pages hosting.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor > paste `supabase/schema.sql` > Run.
3. Authentication > Users > Add user (your email and a strong password). Then run the commented
   `insert into profiles ...` line at the bottom of the schema to make that user an admin.
4. Project Settings > API: copy the **Project URL** and **anon public key**.

## 2. Run locally
```
cp .env.example .env     # paste the URL and anon key
npm install
npm run dev
```

## 3. GitHub
```
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/kganya-royal-funeral.git
git push -u origin main
```
In the repo: Settings > Secrets and variables > Actions: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
Settings > Pages > Source: **GitHub Actions**. Every push to `main` redeploys.

Never commit the Supabase `service_role` key. Only the anon key belongs in the front end.

## Not yet built (compared with the Base44 app)
Customer login/portal, agent portal, tombstone catalogue with photos, FAQ and testimonials,
privacy/POPIA/terms pages, debit-order collections, email/SMS notifications.
