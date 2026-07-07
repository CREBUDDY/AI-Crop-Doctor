# AI Crop Doctor - Production Deployment Checklist

## 1. Security & Authentication
- [ ] **Firebase Rules Configured:** Ensure Firebase Security Rules restrict read/write to authenticated users only.
- [ ] **Environment Variables:** All `.env` files contain production keys (Gemini, OpenWeatherMap, Firebase, PostgreSQL).
- [ ] **Database Passwords:** Use strong, rotated passwords for PostgreSQL. Do NOT use `postgres/postgres`.
- [ ] **SSL/TLS Certificates:** Ensure reverse proxy (Nginx/Traefik) enforces HTTPS for all frontend and API traffic.
- [ ] **CORS Configuration:** Update `backend/app/main.py` to only allow the production frontend domain (e.g., `https://aicropdoctor.com`), removing `*`.

## 2. Database (PostgreSQL)
- [ ] **Connection Pooling:** Set up `PgBouncer` or `SQLAlchemy` connection pooling to handle high concurrency during scaling.
- [ ] **Automated Backups:** Configure daily pg_dump backups or use a managed database (RDS/Cloud SQL) with Point-In-Time-Recovery (PITR) enabled.
- [ ] **Indexes:** Ensure all foreign keys (e.g., `user_id`, `farm_id`) and search columns are properly indexed.

## 3. Frontend Optimizations
- [ ] **Lighthouse Check:** Run a final Lighthouse audit to ensure >90 on Performance and Accessibility.
- [ ] **Caching:** Ensure static assets are served with long-lived `Cache-Control` headers.
- [ ] **PWA Configuration:** Ensure `manifest.json` and Service Workers are properly registered for offline mode.

## 4. AI & APIs
- [ ] **API Rate Limiting:** Implement a rate limiter in FastAPI (e.g., `slowapi`) to prevent API abuse on the `/analyze` endpoint.
- [ ] **Monitoring:** Set up Sentry (or equivalent) for real-time backend error tracking.
- [ ] **Log Rotation:** Ensure production logs don't fill the disk.

## 5. Deployment
- [ ] Run the CI/CD Pipeline to ensure all tests pass.
- [ ] Migrate database schema (`alembic upgrade head`).
- [ ] Scale backend containers based on expected load.
