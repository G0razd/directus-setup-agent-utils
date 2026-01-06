#!/bin/bash
# Installation and Setup Guide for Directus Setup Scripts

echo "🚀 Installing @abakus/directus-setup..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found"
  echo "Create .env with:"
  echo "  DIRECTUS_URL=http://localhost:8055"
  echo "  DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18"
  exit 1
fi

# Check token
if ! grep -q "DIRECTUS_SETUP_TOKEN" .env; then
  echo "Adding DIRECTUS_SETUP_TOKEN to .env..."
  echo "DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18" >> .env
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run setup
echo "🔧 Running Directus setup..."
pnpm --filter @abakus/directus-setup setup

# Show summary
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open admin: http://localhost:8055"
echo "2. Start web: pnpm --filter @abakus/web dev"
echo "3. Visit app: http://localhost:3000"
