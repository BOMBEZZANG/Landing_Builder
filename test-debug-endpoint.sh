#!/bin/bash

echo "======================================"
echo "Testing Debug Endpoints"
echo "======================================"

echo ""
echo "1. Checking email configuration (GET request):"
echo "--------------------------------------"
curl -s https://easy-landing-omega.vercel.app/api/debug-email | python3 -m json.tool 2>/dev/null || echo "Failed to get config"

echo ""
echo ""
echo "2. Testing email sending (POST request):"
echo "--------------------------------------"
curl -s -X POST https://easy-landing-omega.vercel.app/api/debug-email \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail": "bombezzang100@gmail.com"}' | python3 -m json.tool 2>/dev/null || echo "Failed to send test email"

echo ""
echo ""
echo "======================================"
echo "If the debug endpoint is not available yet,"
echo "please deploy the latest code to Vercel first."
echo "======================================" 