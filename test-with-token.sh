#!/bin/bash
# Helper script to test API with token
# Usage: ./test-with-token.sh

# First, login and get token
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vnit.ac.in",
    "password": "admin123"
  }')

# Extract token from response (requires jq or manual extraction)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:50}..."
echo ""

# Now test admin analytics endpoint
echo "📊 Testing admin analytics..."
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "💡 To use this token in other requests:"
echo "   Authorization: Bearer $TOKEN"

