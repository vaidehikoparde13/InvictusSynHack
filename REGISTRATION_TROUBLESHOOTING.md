# Registration Error Troubleshooting

## Common Issues and Solutions

### 1. Check Backend Server is Running

**Problem:** "Cannot connect to server" or "Network Error"

**Solution:**
```bash
# In the root directory, start the backend:
npm run dev

# Or if using nodemon:
npm start
```

Verify backend is running:
- Open browser: `http://localhost:5000/health`
- Should see: `{"success":true,"message":"Server is running"}`

### 2. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check if the request to `/api/auth/register` is being made
  - If request shows red (failed), check the error details
  - If request shows 404, the route might not be registered

### 3. Check CORS Configuration

**Problem:** CORS errors in console

**Solution:**
Verify `server/app.js` has:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 4. Email Already Exists

**Problem:** "User with this email already exists"

**Solution:**
- Use a different email address
- Or login with existing account instead of registering

### 5. Database Connection Issues

**Problem:** "Server error during registration"

**Solution:**
1. Check if PostgreSQL is running
2. Verify database connection in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vnit_grievance
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
3. Test database connection:
   ```bash
   npm run test-db
   ```

### 6. Check API URL Configuration

**Problem:** Requests going to wrong URL

**Solution:**
Create/check `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then restart the frontend dev server.

### 7. Check Required Fields

Make sure all required fields are filled:
- Full Name *
- Email *
- Password *
- Role *

### 8. Check Server Logs

Look at the backend terminal/console for error messages:
- Database errors
- Validation errors
- Connection errors

## Step-by-Step Debugging

### Step 1: Verify Backend
```bash
# Terminal 1 - Start backend
cd /path/to/vnit_grievance
npm run dev
```

Should see:
```
Loading routes...
✅ Auth routes loaded
✅ Resident routes loaded
✅ Admin routes loaded
✅ Worker routes loaded
Server is running on port 5000
```

### Step 2: Verify Frontend
```bash
# Terminal 2 - Start frontend
cd /path/to/vnit_grievance/client
npm run dev
```

Should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### Step 3: Test API Directly

Open browser console and run:
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    full_name: 'Test User',
    role: 'resident'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show the exact error from the backend.

### Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to register
4. Find the `/api/auth/register` request
5. Click on it and check:
   - **Status**: Should be 201 (success) or 400/500 (error)
   - **Response**: Shows the error message from backend
   - **Headers**: Check if request is being sent correctly

## Quick Fixes

### Fix 1: Restart Both Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart:
# Terminal 1:
npm run dev

# Terminal 2:
cd client && npm run dev
```

### Fix 2: Clear Browser Cache
- Clear browser cache and cookies
- Or use Incognito/Private mode

### Fix 3: Check Port Conflicts
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check if port 3000 is in use
netstat -ano | findstr :3000
```

## Expected Behavior

**Successful Registration:**
1. Form submits
2. Toast notification: "Registration successful!"
3. Redirects to appropriate dashboard based on role

**Failed Registration:**
1. Form submits
2. Toast notification shows specific error message
3. Form remains on page

## Getting More Details

The updated code now:
- ✅ Shows detailed error messages
- ✅ Checks backend connection on page load
- ✅ Logs errors to console
- ✅ Handles network errors gracefully

**Check the browser console** for detailed error information!

