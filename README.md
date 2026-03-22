# Josphat Omondi Developer Portfolio & Services Website

Production-ready portfolio and services website with:
- Public pages for visitors
- Admin panel for complete content management
- Node.js backend API
- Supabase PostgreSQL database

## Project Structure

- public/: user-facing website
- admin/: admin dashboard
- server/: API and Supabase integration

## Setup

1. Install dependencies:
   npm install

2. Create .env:
   copy .env.example .env

3. Edit .env values:
   - Keep SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY as provided
   - Add SUPABASE_SERVICE_ROLE_KEY from Supabase Project Settings > API (recommended for admin write operations)
   - Set ADMIN_API_KEY to a strong secret

4. Open Supabase SQL Editor and run:
   server/supabase/schema.sql

5. Start app:
   npm run dev

6. Open:
   - Public: http://localhost:4000/
   - Admin: http://localhost:4000/admin/

## Security Notes

- Never commit .env
- Use service role key on backend only, never in frontend code
- Change ADMIN_API_KEY before deployment

## Production Deployment

- Deploy as a Node.js service
- Set all environment variables in hosting provider
- Restrict CORS_ORIGINS to your exact domain(s)
- Enable HTTPS

## GitHub Safety Before Push

1. Confirm `.env` is ignored by git using `.gitignore`.
2. Keep real secrets only in local `.env` and hosting provider environment variables.
3. Keep `.env.example` committed, but never put real keys in it.
4. If `.env` was ever committed previously, rotate keys in Supabase and generate a new `ADMIN_API_KEY`.

## Deploy Backend on Render

1. Push this project to GitHub.
2. In Render, click New > Web Service.
3. Connect your GitHub repository and select this project.
4. Configure service:
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add environment variables in Render:
   - `PORT=4000`
   - `SUPABASE_URL=your_supabase_project_url`
   - `SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key`
   - `SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`
   - `ADMIN_API_KEY=your_strong_random_secret`
   - `ADMIN_SESSION_DAYS=7`
   - `CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com`
6. Deploy and copy the backend URL, for example: `https://your-backend.onrender.com`.
7. Open Supabase SQL Editor and run `server/supabase/schema.sql` if not already applied.

## Deploy Frontend on Vercel

1. In Vercel, click Add New > Project.
2. Import the same GitHub repository.
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add frontend environment variable for API base URL if your frontend code uses one, pointing to your Render backend URL.
5. Deploy and copy your Vercel URL.
6. Update backend `CORS_ORIGINS` to include your Vercel URL and custom domain.
7. Redeploy backend on Render after changing environment variables.

## Post-Deploy Verification

1. Open public site and confirm content loads.
2. Submit contact form and confirm success message appears.
3. Open `/admin`, sign in, and confirm CRUD actions persist to Supabase.
4. Edit one item in admin and verify the public page updates.
5. Confirm HTTPS is active on both frontend and backend URLs.
