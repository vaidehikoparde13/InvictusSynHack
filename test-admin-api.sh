#!/bin/bash
# Complete test script for admin API
# Usage: ./test-admin-api.sh

echo "🔐 Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vnit.ac.in",
    "password": "admin123"
  }')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Get all complaints to find a complaint ID
echo "📋 Step 2: Getting all complaints..."
COMPLAINTS=$(curl -s -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$COMPLAINTS" | head -20
echo ""

# Extract first complaint ID (if any exist)
COMPLAINT_ID=$(echo "$COMPLAINTS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COMPLAINT_ID" ]; then
  echo "⚠️  No complaints found. Creating a test complaint first..."
  echo ""
  echo "💡 To create a complaint:"
  echo "   1. Register a resident user"
  echo "   2. Login as resident"
  echo "   3. Submit a complaint"
  echo "   4. Then come back and approve it"
  exit 0
fi

echo "✅ Found complaint ID: $COMPLAINT_ID"
echo ""

# Step 3: Get analytics
echo "📊 Step 3: Getting analytics..."
curl -s -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""

# Step 4: Approve complaint (if status is Pending)
echo "✅ Step 4: Approving complaint $COMPLAINT_ID..."
APPROVE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/complaints/$COMPLAINT_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$APPROVE_RESPONSE" | jq '.' 2>/dev/null || echo "$APPROVE_RESPONSE"
echo ""

echo "✅ Test complete!"
echo ""
echo "💡 To use the token in other commands:"
echo "   export TOKEN=\"$TOKEN\""
echo "   curl -X GET http://localhost:5000/api/admin/analytics -H \"Authorization: Bearer \$TOKEN\""

