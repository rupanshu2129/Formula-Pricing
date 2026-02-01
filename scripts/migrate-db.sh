#!/bin/bash

set -e

echo "🚀 VAP Pricing Portal - Database Migration Script"
echo "=================================================="
echo ""

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Please set your production database URL:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/database'"
  echo ""
  echo "Or pull from Vercel:"
  echo "  vercel env pull .env.local"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

echo "📦 Installing dependencies..."
npm install
echo ""

echo "🔧 Generating Prisma Client..."
npx prisma generate
echo ""

echo "🗄️  Pushing database schema..."
npx prisma db push
echo ""

echo "🌱 Seeding database with initial data..."
npm run prisma:seed
echo ""

echo "✅ Database migration completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify data in Prisma Studio: npx prisma studio"
echo "  2. Deploy to Vercel: vercel --prod"
echo ""
