#!/bin/bash

# OAuth Flow Test Script
# This script demonstrates the complete OAuth flow step by step

SERVER_URL="http://localhost:3000"

echo "=== MCP OAuth Flow Test ==="
echo ""

# Step 1: Register a client
echo "1. Registering OAuth client..."
CLIENT_RESPONSE=$(curl -s -X POST "$SERVER_URL/oauth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test CLI Client",
    "redirect_uris": ["http://localhost:3000/callback"],
    "scope": "read:stuff write:stuff"
  }')

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.client_id')
echo "   Client ID: $CLIENT_ID"
echo ""

# Step 2: Generate PKCE parameters
echo "2. Generating PKCE parameters..."
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d "=+/" | cut -c 1-43)
CODE_CHALLENGE=$(echo -n "$CODE_VERIFIER" | openssl dgst -sha256 -binary | openssl enc -base64 | tr -d "=+/" | tr "+/" "-_")
STATE=$(openssl rand -hex 16)

echo "   Code Verifier: $CODE_VERIFIER"
echo "   Code Challenge: $CODE_CHALLENGE"
echo ""

# Step 3: Build authorization URL
echo "3. Authorization URL:"
AUTH_URL="$SERVER_URL/oauth/authorize?client_id=$CLIENT_ID&redirect_uri=http://localhost:3000/callback&response_type=code&scope=read:stuff&state=$STATE&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256"
echo "   $AUTH_URL"
echo ""
echo "   Open this URL in your browser. You'll be redirected to:"
echo "   http://localhost:3000/callback?code=AUTHORIZATION_CODE&state=$STATE"
echo ""

# Step 4: Exchange code for token
echo "4. After getting the authorization code, exchange it for a token:"
echo ""
echo "curl -X POST '$SERVER_URL/oauth/token' \\"
echo "  -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "  -d 'grant_type=authorization_code&code=YOUR_AUTH_CODE&client_id=$CLIENT_ID&redirect_uri=http://localhost:3000/callback&code_verifier=$CODE_VERIFIER'"
echo ""

# Step 5: Use the token
echo "5. Use the access token to call MCP:"
echo ""
echo "curl -X POST '$SERVER_URL/sse' \\"
echo "  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}'"
echo ""

# Optional: Test with the old test token
echo "=== Testing with legacy test token ==="
echo "curl -X POST '$SERVER_URL/sse' \\"
echo "  -H 'Authorization: Bearer __TEST_VALUE__123' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}'"