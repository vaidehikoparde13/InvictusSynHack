# Quick Fix: Registration Failed

## The Problem
Your backend server is **not running**. The registration form can't connect to the API.

## Solution: Start the Backend Server

### Step 1: Open a Terminal

Open a new terminal/command prompt in your project directory.

### Step 2: Start Backend Server

```bash
# Make sure you're in the root directory (vnit_grievance)
npm run dev
```

You should see:
```
Loading routes...
✅ Auth routes loaded
✅ Resident routes loaded
✅ Admin routes loaded
✅ Worker routes loaded
Server is running on port 5000
```

### Step 3: Keep It Running

**Keep this terminal open** - the server must stay running for the frontend to work.

### Step 4: Verify Backend is Running

Open browser and go to: `http://localhost:5000/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### Step 5: Try Registration Again

Now go back to `http://localhost:3000/register` and try registering again.

## Running Both Servers

You need **TWO terminals** running:

**Terminal 1 - Backend:**
```bash
cd C:\Users\prern\OneDrive\Desktop\vnit_grievance
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\prern\OneDrive\Desktop\vnit_grievance\client
npm run dev
```

## Quick Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database is connected (check backend console for "PostgreSQL connected")
- [ ] No errors in backend console
- [ ] Browser console shows no CORS errors

## Still Having Issues?

1. **Check backend console** for error messages
2. **Check browser console** (F12) for detailed errors
3. **Check Network tab** in browser DevTools to see the actual API request/response

The updated code will now show you more detailed error messages!

