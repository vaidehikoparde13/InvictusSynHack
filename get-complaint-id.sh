#!/bin/bash
# Get a complaint ID to use in approve/reject commands

echo "🔐 Logging in as admin..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnit.ac.in","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo ""

echo "📋 Getting all complaints..."
COMPLAINTS=$(curl -s -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Extract first complaint ID
COMPLAINT_ID=$(echo "$COMPLAINTS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COMPLAINT_ID" ]; then
  echo "⚠️  No complaints found!"
  echo ""
  echo "💡 Create a complaint first:"
  echo "   1. Register a resident user"
  echo "   2. Login as resident"
  echo "   3. Submit a complaint"
  echo "   4. Then come back here"
else
  echo "✅ Found complaint ID: $COMPLAINT_ID"
  echo ""
  echo "📝 Use this command to approve:"
  echo "curl -X POST http://localhost:5000/api/admin/complaints/$COMPLAINT_ID/approve \\"
  echo "  -H \"Authorization: Bearer $TOKEN\""
  echo ""
  echo "📝 Use this command to reject:"
  echo "curl -X POST http://localhost:5000/api/admin/complaints/$COMPLAINT_ID/reject \\"
  echo "  -H \"Authorization: Bearer $TOKEN\" \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"rejection_reason\": \"Not a valid complaint\"}'"
fi

