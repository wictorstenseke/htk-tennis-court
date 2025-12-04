#!/bin/bash
# Test script to simulate GitHub Pages deployment locally

set -e

echo "🧪 Testing GitHub Pages deployment build..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Run tests
echo "✅ Running tests..."
npm run test:run

# Build with GitHub Pages environment
echo "🏗️  Building for GitHub Pages..."
GITHUB_PAGES=true npm run build

# Verify build output
echo "🔍 Verifying build output..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Error: dist/index.html not found"
  exit 1
fi

# Check if base path is correct
if grep -q "/htk-tennis-v2/" dist/index.html; then
  echo "✅ Base path correctly set to /htk-tennis-v2/"
else
  echo "⚠️  Warning: Base path might not be set correctly"
fi

echo "✅ Deployment build test passed!"
echo ""
echo "📁 Build output:"
ls -lh dist/
echo ""
echo "💡 To preview locally, run: npm run preview"

