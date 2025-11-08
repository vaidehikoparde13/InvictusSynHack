# Quick API Test Guide

## The Problem

You're getting errors because:
1. **Using placeholder `COMPLAINT_ID`** instead of an actual UUID
2. **Token might be corrupted** in the command line

## Solution: Step-by-Step Testing

### Step 1: Login and Save Token

```bash
# Login
LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}')

# Extract and save token
TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Verify token
echo "Token: ${TOKEN:0:50}..."
```

### Step 2: Get All Complaints (to find a real ID)

```bash
curl -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Look for:** `"id": "some-uuid-here"` in the response

### Step 3: Use Real Complaint ID

```bash
# Replace COMPLAINT_ID with actual UUID from Step 2
curl -X POST http://localhost:5000/api/admin/complaints/ACTUAL_UUID_HERE/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Complete Working Example

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Get analytics (this works without needing a complaint ID)
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN"

# 3. Get all complaints
curl -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN"

# 4. Extract first complaint ID (if any exist)
COMPLAINT_ID=$(curl -s -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# 5. Approve complaint (if ID was found)
if [ ! -z "$COMPLAINT_ID" ]; then
  curl -X POST http://localhost:5000/api/admin/complaints/$COMPLAINT_ID/approve \
    -H "Authorization: Bearer $TOKEN"
else
  echo "No complaints found. Create one first!"
fi
```

## If You Get "No complaints found"

You need to create a complaint first:

1. **Register a resident:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "student123",
    "full_name": "Test Student",
    "role": "resident",
    "student_id": "2021BCS001"
  }'
```

2. **Login as resident:**
```bash
RESIDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

3. **Submit a complaint:**
```bash
curl -X POST http://localhost:5000/api/resident/complaints \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "WiFi not working",
    "description": "Unable to connect to WiFi",
    "category": "Infrastructure",
    "subcategory": "Internet",
    "priority": "High"
  }'
```

4. **Copy the complaint ID from response, then approve as admin**

## Quick Test Script

Run the provided script:
```bash
chmod +x test-admin-api.sh
./test-admin-api.sh
```

This will:
- Login automatically
- Get all complaints
- Show analytics
- Approve a complaint if one exists

## Common Errors

### "Invalid token"
- Token expired (login again)
- Token corrupted (copy entire token, no spaces)
- Missing "Bearer " prefix

### "Server error while approving complaint"
- Complaint ID doesn't exist (use real UUID)
- Complaint already processed
- Database error (check server logs)

### "No complaints found"
- Create a complaint first (see above)

