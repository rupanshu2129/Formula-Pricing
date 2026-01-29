#!/bin/bash

echo "🚀 Setting up VAP Pricing Portal..."

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is running and update .env with your database URL"

if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your database credentials"
fi

echo "🔧 Generating Prisma client..."
npm run prisma:generate

echo "📊 Pushing database schema..."
npm run prisma:push

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
