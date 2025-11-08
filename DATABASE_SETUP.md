# PostgreSQL Database Setup Guide

## Step 1: Install PostgreSQL (if not already installed)

### Option A: Download and Install PostgreSQL

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (recommended: PostgreSQL 14 or higher)
   - Or use the EnterpriseDB installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - **Important:** Remember the password you set for the `postgres` superuser
   - Default port: `5432` (keep this unless you have a conflict)
   - Default installation location: `C:\Program Files\PostgreSQL\<version>`

3. **Verify Installation:**
   - Open Command Prompt or PowerShell
   - Navigate to PostgreSQL bin directory:
     ```bash
     cd "C:\Program Files\PostgreSQL\<version>\bin"
     ```
   - Test connection:
     ```bash
     psql --version
     ```

### Option B: Using Chocolatey (if you have it)

```bash
choco install postgresql
```

### Option C: Using Docker (Alternative)

```bash
docker run --name vnit-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vnit_grievance -p 5432:5432 -d postgres
```

## Step 2: Add PostgreSQL to PATH (Optional but Recommended)

1. **Find PostgreSQL bin directory:**
   - Usually: `C:\Program Files\PostgreSQL\<version>\bin`

2. **Add to PATH:**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\PostgreSQL\<version>\bin`
   - Click "OK" on all dialogs

3. **Verify:**
   - Open a new Command Prompt
   - Type: `psql --version`
   - Should show the version number

## Step 3: Start PostgreSQL Service

### Check if PostgreSQL is Running:

1. **Using Services:**
   - Press `Win + R`, type `services.msc`, press Enter
   - Look for "postgresql-x64-<version>" service
   - Right-click → Start (if not running)

2. **Using Command Prompt (as Administrator):**
   ```bash
   # Check status
   sc query postgresql-x64-<version>
   
   # Start service
   net start postgresql-x64-<version>
   ```

## Step 4: Create the Database

### Method 1: Using psql Command Line

1. **Open Command Prompt or PowerShell**

2. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   - Enter the password you set during installation

3. **Create the database:**
   ```sql
   CREATE DATABASE vnit_grievance;
   ```

4. **Verify database was created:**
   ```sql
   \l
   ```
   - You should see `vnit_grievance` in the list

5. **Exit psql:**
   ```sql
   \q
   ```

### Method 2: Using pgAdmin (GUI Tool)

1. **Open pgAdmin** (installed with PostgreSQL)

2. **Connect to Server:**
   - Right-click "Servers" → "Create" → "Server"
   - Name: `localhost`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your password)
   - Click "Save"

3. **Create Database:**
   - Right-click "Databases" → "Create" → "Database"
   - Name: `vnit_grievance`
   - Click "Save"

## Step 5: Configure Environment Variables

1. **Create `.env` file** in your project root (if not exists)

2. **Add database configuration:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vnit_grievance
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

3. **Replace `your_postgres_password_here`** with your actual PostgreSQL password

## Step 6: Initialize Database Schema

### Method 1: Using npm script (Recommended)

```bash
npm run init-db
```

### Method 2: Using psql directly

```bash
psql -U postgres -d vnit_grievance -f server/database/schema.sql
```

Enter your password when prompted.

### Method 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your server
3. Right-click `vnit_grievance` database → "Query Tool"
4. Open `server/database/schema.sql` file
5. Copy all contents and paste into Query Tool
6. Click "Execute" (F5)

## Step 7: Verify Database Setup

### Check Tables Were Created:

```bash
psql -U postgres -d vnit_grievance
```

Then run:
```sql
-- List all tables
\dt

-- Check users table structure
\d users

-- Check complaints table structure
\d complaints

-- Exit
\q
```

You should see these tables:
- users
- complaints
- comments
- attachments
- notifications
- worker_logs

## Step 8: Test Database Connection

1. **Start your Node.js server:**
   ```bash
   npm run dev
   ```

2. **Check console output:**
   - Should see: `PostgreSQL connected`
   - If you see connection errors, check:
     - PostgreSQL service is running
     - Database credentials in `.env` are correct
     - Database `vnit_grievance` exists

## Troubleshooting

### Problem: "psql: command not found"

**Solution:**
- PostgreSQL bin directory is not in PATH
- Use full path: `"C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres`
- Or add to PATH (see Step 2)

### Problem: "password authentication failed"

**Solution:**
- Check password in `.env` matches PostgreSQL password
- Try resetting password:
  ```bash
  # Edit pg_hba.conf to allow trust authentication temporarily
  # File location: C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf
  # Change "md5" to "trust" for local connections
  # Restart PostgreSQL service
  # Then connect without password and reset:
  psql -U postgres
  ALTER USER postgres PASSWORD 'newpassword';
  ```

### Problem: "database does not exist"

**Solution:**
- Create the database (see Step 4)
- Verify database name in `.env` matches

### Problem: "connection refused"

**Solution:**
- Check PostgreSQL service is running
- Verify port 5432 is not blocked by firewall
- Check if another application is using port 5432

### Problem: "permission denied"

**Solution:**
- Ensure user has proper permissions
- Try connecting as `postgres` superuser first
- Grant permissions:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE vnit_grievance TO postgres;
  ```

### Problem: "relation does not exist" after running schema

**Solution:**
- Check if you're connected to the correct database
- Re-run the schema: `npm run init-db`
- Check for errors in the schema execution

## Quick Reference Commands

```bash
# Connect to PostgreSQL
psql -U postgres

# Connect to specific database
psql -U postgres -d vnit_grievance

# List all databases
psql -U postgres -c "\l"

# List all tables in current database
psql -U postgres -d vnit_grievance -c "\dt"

# Run SQL file
psql -U postgres -d vnit_grievance -f server/database/schema.sql

# Check PostgreSQL version
psql --version

# Check if PostgreSQL is running (Windows)
sc query postgresql-x64-<version>

# Start PostgreSQL service (Windows, as Admin)
net start postgresql-x64-<version>

# Stop PostgreSQL service (Windows, as Admin)
net stop postgresql-x64-<version>
```

## Next Steps

After database setup is complete:

1. ✅ Create an admin user: `npm run create-admin admin@vnit.ac.in admin123 "Admin User" ADMIN001`
2. ✅ Test the API endpoints
3. ✅ Start building your React frontend

## Alternative: Using Docker (If you prefer)

If you have Docker installed, you can use this instead:

```bash
# Run PostgreSQL in Docker
docker run --name vnit-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vnit_grievance \
  -p 5432:5432 \
  -d postgres:14

# Then update .env:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vnit_grievance
DB_USER=postgres
DB_PASSWORD=postgres
```

Then run: `npm run init-db`

