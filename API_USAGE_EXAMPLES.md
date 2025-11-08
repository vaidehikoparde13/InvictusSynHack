# API Usage Examples

## Getting and Using JWT Tokens

### Step 1: Login to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vnit.ac.in",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Step 2: Copy the Token

Copy the `token` value from the response. It's a long string that looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg
```

### Step 3: Use Token in Protected Routes

Replace `YOUR_ACTUAL_TOKEN` with the token you received:

```bash
# Example: Get admin analytics
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg" \
  -H "Content-Type: application/json"
```

## Complete Examples

### Admin: Get Analytics

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Use token
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN"
```

### Resident: Submit Complaint

```bash
# 1. Login as resident
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"resident@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Submit complaint
curl -X POST http://localhost:5000/api/resident/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "WiFi not working",
    "description": "Unable to connect to WiFi in room 201",
    "category": "Infrastructure",
    "subcategory": "Internet",
    "priority": "High"
  }'
```

### Admin: Approve Complaint

```bash
# Use admin token (from login above)
curl -X POST http://localhost:5000/api/admin/complaints/COMPLAINT_ID/approve \
  -H "Authorization: Bearer $TOKEN"
```

Replace `COMPLAINT_ID` with the actual UUID of the complaint.

## Using Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@vnit.ac.in",
       "password": "admin123"
     }
     ```

2. **Copy Token:**
   - From the response, copy the `token` value

3. **Use Token:**
   - Go to your protected endpoint
   - Headers tab
   - Add header: `Authorization`
   - Value: `Bearer <paste-your-token-here>`

## Common Mistakes

❌ **Wrong:** `Authorization: Bearer ADMIN_TOKEN_HERE`  
✅ **Correct:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

❌ **Wrong:** `Authorization: Bearer token`  
✅ **Correct:** `Authorization: Bearer <actual-token-string>`

❌ **Wrong:** Missing "Bearer " prefix  
✅ **Correct:** Always include "Bearer " before the token

## Token Expiration

- Tokens expire after **7 days**
- If you get "Invalid token" or "Token expired", login again to get a new token

## Quick Test

Here's your actual token from the login (valid for 7 days):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg
```

Test it:
```bash
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg"
```

