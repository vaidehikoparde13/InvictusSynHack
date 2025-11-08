# API Troubleshooting: "Route not found" Error

## Quick Fix Steps

### 1. Restart the Server

The server needs to be restarted after any code changes:

```bash
# Stop the current server (Ctrl+C in the terminal where it's running)
# Then restart:
npm run dev
```

### 2. Verify Server is Running

Check if the server is running on port 5000:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Or in browser:
http://localhost:5000/health
```

### 3. Check Route Registration

When the server starts, you should see:
```
Loading routes...
✅ Auth routes loaded
✅ Resident routes loaded
✅ Admin routes loaded
✅ Worker routes loaded
Server is running on port 5000
```

If you see errors loading routes, that's the problem.

### 4. Test the API

Run the test script:
```bash
node test-api.js
```

## Common Issues

### Issue 1: Routes Not Loading

**Symptoms:**
- No "✅ Routes loaded" messages in console
- Error when starting server

**Solution:**
- Check for syntax errors in route files
- Verify all required modules are installed: `npm install`
- Check console for specific error messages

### Issue 2: 404 for All POST Requests

**Symptoms:**
- GET requests work (like `/health`)
- POST requests return 404

**Possible Causes:**
1. **Middleware Issue:** Check if `express.json()` middleware is properly configured
2. **Route Order:** Routes must be registered before the 404 handler
3. **CORS Issue:** If testing from browser, check CORS settings

### Issue 3: Server Not Responding

**Symptoms:**
- Connection refused errors
- No response from server

**Solution:**
1. Check if server is running: `netstat -ano | findstr :5000` (Windows)
2. Check if port 5000 is available
3. Verify server started without errors

## Testing Endpoints

### Using curl (Command Line)

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"full_name\":\"Test User\",\"role\":\"resident\"}"
```

### Using Postman

1. Create new request
2. Method: POST
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "email": "test@test.com",
     "password": "test123"
   }
   ```

### Using Browser (for GET only)

Open: `http://localhost:5000/health`

For POST requests, use Postman, curl, or the test script.

## Verify Route Registration

Check server console output when starting. You should see:
- Route loading messages
- No errors
- Server listening on port 5000

## Debug Mode

The server now logs:
- When routes are loaded
- 404 errors with method and path
- All errors in development mode

Check your server console for these messages.

