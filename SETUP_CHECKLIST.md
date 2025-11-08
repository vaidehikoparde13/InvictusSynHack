# Setup Checklist

Use this checklist to ensure your PostgreSQL database is properly set up.

## Pre-Setup

- [ ] PostgreSQL is installed on your system
- [ ] PostgreSQL service is running
- [ ] You know your PostgreSQL `postgres` user password

## Database Setup

- [ ] Created database `vnit_grievance`
- [ ] Verified database exists (run: `psql -U postgres -l`)

## Configuration

- [ ] Created `.env` file in project root
- [ ] Added database credentials to `.env`:
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_NAME=vnit_grievance`
  - [ ] `DB_USER=postgres`
  - [ ] `DB_PASSWORD=<your_password>`
- [ ] Added other required variables:
  - [ ] `PORT=5000`
  - [ ] `JWT_SECRET=<your-secret-key>`
  - [ ] `NODE_ENV=development`

## Database Schema

- [ ] Ran database initialization: `npm run init-db`
- [ ] Verified tables were created:
  - [ ] `users` table exists
  - [ ] `complaints` table exists
  - [ ] `comments` table exists
  - [ ] `attachments` table exists
  - [ ] `notifications` table exists
  - [ ] `worker_logs` table exists

## Connection Test

- [ ] Tested database connection: `npm run test-db`
- [ ] Connection test passed successfully

## Initial Setup

- [ ] Created admin user: `npm run create-admin <email> <password> <name> [student_id]`
- [ ] Verified admin user can login via API

## Server Test

- [ ] Started server: `npm run dev`
- [ ] Server starts without errors
- [ ] Health check works: `GET http://localhost:5000/health`
- [ ] Can register a new user via API
- [ ] Can login via API

## Quick Commands Reference

```bash
# Test database connection
npm run test-db

# Initialize database schema
npm run init-db

# Create admin user
npm run create-admin admin@vnit.ac.in admin123 "Admin User" ADMIN001

# Start development server
npm run dev
```

## Troubleshooting Commands

```bash
# Check PostgreSQL version
psql --version

# Check if PostgreSQL is running (Windows)
sc query postgresql-x64-<version>

# Connect to PostgreSQL
psql -U postgres

# List databases
psql -U postgres -c "\l"

# Connect to your database
psql -U postgres -d vnit_grievance

# List tables
psql -U postgres -d vnit_grievance -c "\dt"
```

## Next Steps After Setup

1. ✅ Test API endpoints using Postman or curl
2. ✅ Start building React frontend
3. ✅ Implement authentication flow
4. ✅ Build complaint submission form
5. ✅ Create admin dashboard
6. ✅ Build worker panel

