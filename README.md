# House of Ramyaa

House of Ramyaa is a Rajasthani clothing store with a Next.js storefront and a standalone Express backend.

## Project structure

```text
frontend/   Next.js storefront, admin area, Next API routes, Prisma schema and seed data
backend/    Express API server for standalone backend deployment
```

Both services use the SQLite database at `frontend/prisma/dev.db` during local development.

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   npm --prefix frontend install
   npm --prefix backend install
   ```

2. Create environment files:

   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   Copy-Item frontend/.env.example frontend/.env.local
   Copy-Item backend/.env.example backend/.env
   ```

   Update the SMTP values in `frontend/.env.local` if registration OTP emails are required. For Gmail, use an App Password.

3. Seed the local database:

   ```powershell
   npm run seed
   ```

4. Start both services:

   ```powershell
   npm run dev
   ```

   Frontend: `http://localhost:3000`

   Backend health check: `http://localhost:5000/api/health`

## Production builds

```powershell
npm run build
```

The frontend can be deployed from `frontend/` with `npm run build && npm start`. The backend can be deployed from `backend/` with `npm run build && npm start`.

Never commit `.env`, `.env.local`, SQLite database files, or generated build folders. Use the `.env.example` files as templates.
