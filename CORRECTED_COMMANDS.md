# Corrected API Commands

## Your Command (Incorrect)

```bash
curl -X POST http://localhost:5000/api/admin/complaints/COMPLAINT_ID/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Problem:** `COMPLAINT_ID` is a placeholder, not a real UUID.

## Step 1: Get a Real Complaint ID

First, get all complaints to find an actual UUID:

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get all complaints
curl -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN"
```

**Look for:** `"id": "30f0cfb3-d8a1-4c21-a234-5b709788f88a"` (example UUID)

## Step 2: Use the Real UUID

Replace `COMPLAINT_ID` with the actual UUID from Step 1:

```bash
# CORRECTED COMMAND (replace YOUR_COMPLAINT_UUID with actual UUID)
curl -X POST http://localhost:5000/api/admin/complaints/YOUR_COMPLAINT_UUID/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg"
```

## Complete Working Example

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Get complaints and extract first ID
COMPLAINT_ID=$(curl -s -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# 3. Approve complaint (if one exists)
if [ ! -z "$COMPLAINT_ID" ]; then
  curl -X POST http://localhost:5000/api/admin/complaints/$COMPLAINT_ID/approve \
    -H "Authorization: Bearer $TOKEN"
else
  echo "No complaints found. Create one first!"
fi
```

## Quick Script

Run this to get a complaint ID automatically:

```bash
chmod +x get-complaint-id.sh
./get-complaint-id.sh
```

## If You Have No Complaints

Create one first:

```bash
# Register resident
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test123",
    "full_name": "Test Student",
    "role": "resident"
  }'

# Login as resident
RESIDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"test123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Submit complaint
curl -X POST http://localhost:5000/api/resident/complaints \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "WiFi Issue",
    "description": "WiFi not working in room 201",
    "category": "Infrastructure",
    "subcategory": "Internet",
    "priority": "High"
  }'

# Copy the "id" from the response, then use it in approve command
```

## Your Corrected Command Format

```bash
# Replace abc123-def456-... with actual complaint UUID
curl -X POST http://localhost:5000/api/admin/complaints/abc123-def456-ghi789-jkl012/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGYwY2ZiMy1kOGExLTRjMjEtYTIzNC01YjcwOTc4OGY4OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI2MTAzODksImV4cCI6MTc2MzIxNTE4OX0.ineBeugiNLrxoNZPrn0_74UjBdrMIj7SNugzkzHKsvg"
```

**Key Points:**
- ✅ Token is correct
- ✅ Command format is correct
- ❌ Replace `COMPLAINT_ID` with actual UUID (looks like: `30f0cfb3-d8a1-4c21-a234-5b709788f88a`)

