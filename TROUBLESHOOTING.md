# Troubleshooting: npm run init-db Not Working

## Common Issues and Solutions

### Issue 1: No Output / Script Runs But Does Nothing

**Symptoms:**
- Command runs but produces no output
- Script exits silently

**Solutions:**

1. **Check if .env file exists:**
   ```bash
   ls -la .env
   # or on Windows
   dir .env
   ```

2. **Create .env file if missing:**
   Create a `.env` file in the project root with:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vnit_grievance
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:3000
   ```

3. **Verify database exists:**
   - The database `vnit_grievance` must exist before running init-db
   - Create it using pgAdmin or psql

### Issue 2: psql Command Not Found

**Symptoms:**
```
bash: psql: command not found
```

**Solutions:**

**Option A: Use Full Path (Windows)**
```bash
# Find PostgreSQL installation (usually in Program Files)
"C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres
```

**Option B: Add to PATH**
1. Find PostgreSQL bin directory: `C:\Program Files\PostgreSQL\<version>\bin`
2. Add to Windows PATH environment variable
3. Restart terminal

**Option C: Use pgAdmin (GUI)**
- Open pgAdmin
- Connect to server
- Right-click Databases → Create → Database
- Name: `vnit_grievance`

### Issue 3: Database Connection Failed

**Symptoms:**
```
❌ Database connection failed!
Error: password authentication failed
```

**Solutions:**

1. **Check PostgreSQL password:**
   - Verify password in `.env` matches PostgreSQL password
   - Try connecting manually: `psql -U postgres`

2. **Reset PostgreSQL password (if needed):**
   - Edit `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\<version>\data\`)
   - Change `md5` to `trust` for local connections
   - Restart PostgreSQL service
   - Connect without password and reset:
     ```sql
     ALTER USER postgres PASSWORD 'newpassword';
     ```
   - Change `trust` back to `md5` in pg_hba.conf
   - Restart PostgreSQL service

### Issue 4: Database Does Not Exist

**Symptoms:**
```
Error: database "vnit_grievance" does not exist
```

**Solutions:**

**Using psql:**
```bash
psql -U postgres
CREATE DATABASE vnit_grievance;
\q
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `vnit_grievance`
5. Click "Save"

**Using createdb command:**
```bash
createdb -U postgres vnit_grievance
```

### Issue 5: PostgreSQL Service Not Running

**Symptoms:**
```
Error: connect ECONNREFUSED
```

**Solutions:**

**Windows:**
1. Press `Win + R`, type `services.msc`
2. Find `postgresql-x64-<version>`
3. Right-click → Start

**Or using Command Prompt (as Admin):**
```bash
net start postgresql-x64-<version>
```

**Check if running:**
```bash
sc query postgresql-x64-<version>
```

### Issue 6: Port Already in Use

**Symptoms:**
```
Error: Port 5432 is already in use
```

**Solutions:**

1. **Find what's using the port:**
   ```bash
   netstat -ano | findstr :5432
   ```

2. **Change PostgreSQL port:**
   - Edit `postgresql.conf` (in data directory)
   - Change `port = 5432` to another port
   - Update `.env` file with new port
   - Restart PostgreSQL service

### Quick Diagnostic Steps

Run these commands to diagnose:

1. **Test database connection:**
   ```bash
   npm run test-db
   ```

2. **Check .env file:**
   ```bash
   # Make sure .env exists and has correct values
   cat .env
   # or on Windows
   type .env
   ```

3. **Verify PostgreSQL is running:**
   ```bash
   # Windows
   sc query postgresql-x64-<version>
   ```

4. **Test connection manually:**
   ```bash
   # If psql is in PATH
   psql -U postgres -d vnit_grievance
   
   # Or use full path
   "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres
   ```

## Step-by-Step Fix

Follow these steps in order:

1. ✅ **Create .env file** (if missing)
2. ✅ **Verify PostgreSQL is running**
3. ✅ **Create database** `vnit_grievance`
4. ✅ **Test connection:** `npm run test-db`
5. ✅ **Run init-db:** `npm run init-db`

## Still Not Working?

If you're still having issues:

1. Check the error message carefully
2. Verify all credentials in `.env`
3. Try connecting with pgAdmin to verify PostgreSQL works
4. Check PostgreSQL logs (usually in `data\pg_log` folder)
5. Make sure you're using the correct PostgreSQL version

## Alternative: Use Docker

If PostgreSQL installation is problematic, use Docker:

```bash
# Run PostgreSQL in Docker
docker run --name vnit-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vnit_grievance \
  -p 5432:5432 \
  -d postgres:14

# Update .env
DB_PASSWORD=postgres

# Then run
npm run init-db
```

