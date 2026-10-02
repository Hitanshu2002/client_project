# House of Ramyaa

House of Ramyaa is a Rajasthani clothing store with a Next.js storefront and a standalone Express backend.

## Project structure

```text
frontend/   Next.js storefront, admin area, Next API routes, Prisma schema and seed data
backend/    Express API server for standalone backend deployment
```

Both services use the SQLite database at `frontend/prisma/dev.db` during local development. In production, set `DATABASE_URL` and `UPLOAD_DIR` to paths outside the Git checkout so deployments do not overwrite client data.

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

   Product uploads are stored in `frontend/public/uploads` and the SQLite database is stored in `frontend/prisma/dev.db`.

## Production builds

```powershell
npm run build
```

The frontend can be deployed from `frontend/` with `npm run build && npm start`. The backend can be deployed from `backend/` with `npm run build && npm start`.

For a single EC2 test server, install PM2 and run `pm2 start ecosystem.config.cjs` from the project root. Keep the EC2 disk and `frontend/prisma/dev.db` backed up because SQLite and uploads are local files.

Never commit `.env`, `.env.local`, SQLite database files, or generated build folders. Use the `.env.example` files as templates.

## AWS Free Tier test deployment

For a client test, the simplest deployment is one Ubuntu EC2 instance. Nginx serves the public site on port 80, PM2 runs both Node services, and the database/uploads live on the EC2 EBS disk outside this Git checkout.

On the server, create persistent storage and production environment files:

```bash
sudo mkdir -p /var/lib/house-of-ramyaa/uploads /var/lib/house-of-ramyaa/backups
sudo chown -R ubuntu:ubuntu /var/lib/house-of-ramyaa
nano frontend/.env.production
nano backend/.env
```

Use the same absolute database path and upload directory in both files:

```env
DATABASE_URL="file:/var/lib/house-of-ramyaa/house-of-ramyaa.db"
UPLOAD_DIR=/var/lib/house-of-ramyaa/uploads
JWT_SECRET="a-long-random-secret"
```

Add the SMTP settings from the corresponding `.env.example` files. `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` should contain the public EC2 IP or your domain.

Build and start the application:

```bash
set -a; source frontend/.env.production; set +a
npm run seed       # First deployment only; this resets/creates demo data.
npm run build
pm2 start ecosystem.config.cjs
pm2 startup systemd
# Copy and run the sudo command printed by pm2 startup, then:
pm2 save
```

Configure Nginx to proxy port 80 to `127.0.0.1:3000` and serve the persistent upload directory:

```nginx
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    location /uploads/ {
        alias /var/lib/house-of-ramyaa/uploads/;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Do not expose ports 3000 or 5000 in the EC2 security group. Back up `/var/lib/house-of-ramyaa/house-of-ramyaa.db` and `/var/lib/house-of-ramyaa/uploads` before upgrades. Do not run `git clean -fdx` on the server because it can remove ignored runtime data.
