#!/bin/bash

echo "============================================"
echo "EngrAssist Cloudflare Setup Script"
echo "============================================"
echo ""

# Ask for the API token
echo "Please paste your Cloudflare API token and press Enter:"
read -r API_TOKEN

echo ""
echo "Setting up Cloudflare authentication..."
export CLOUDFLARE_API_TOKEN="$API_TOKEN"

# Save to profile for persistence
if [ -f ~/.bashrc ]; then
    echo "export CLOUDFLARE_API_TOKEN=\"$API_TOKEN\"" >> ~/.bashrc
elif [ -f ~/.zshrc ]; then
    echo "export CLOUDFLARE_API_TOKEN=\"$API_TOKEN\"" >> ~/.zshrc
fi

echo ""
echo "Testing authentication..."
if ! wrangler whoami; then
    echo ""
    echo "ERROR: Authentication failed. Please check your token and try again."
    exit 1
fi

echo ""
echo "============================================"
echo "Authentication successful!"
echo "Creating D1 database..."
echo "============================================"
echo ""

cd "$(dirname "$0")"
wrangler d1 create engrassist-db > db-output.txt 2>&1

echo ""
echo "Extracting database ID..."
DB_ID=$(grep -oP 'database_id = "\K[^"]+' db-output.txt)

if [ -z "$DB_ID" ]; then
    echo "ERROR: Could not create database. Output:"
    cat db-output.txt
    exit 1
fi

echo "Database created with ID: $DB_ID"
echo ""

echo "Updating wrangler.toml with database ID..."
sed -i "s/database_id = \"YOUR_DATABASE_ID\"/database_id = \"$DB_ID\"/" wrangler.toml

echo ""
echo "============================================"
echo "Initializing database schema..."
echo "============================================"
echo ""

wrangler d1 execute engrassist-db --file=schema.sql

echo ""
echo "============================================"
echo "Setting up JWT secret..."
echo "============================================"
echo ""

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo "$JWT_SECRET" | wrangler secret put JWT_SECRET

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "Your Cloudflare backend is ready!"
echo ""
echo "Next steps:"
echo "1. Test locally: wrangler dev"
echo "2. Deploy to production: wrangler deploy"
echo ""
echo "Press any key to exit..."
read -n 1
