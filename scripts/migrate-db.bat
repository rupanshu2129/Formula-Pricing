@echo off
setlocal enabledelayedexpansion

echo 🚀 VAP Pricing Portal - Database Migration Script
echo ==================================================
echo.

if "%DATABASE_URL%"=="" (
  echo ❌ ERROR: DATABASE_URL environment variable is not set
  echo.
  echo Please set your production database URL:
  echo   set DATABASE_URL=postgresql://user:password@host:5432/database
  echo.
  echo Or pull from Vercel:
  echo   vercel env pull .env.local
  echo.
  exit /b 1
)

echo ✅ DATABASE_URL is set
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 exit /b 1
echo.

echo 🔧 Generating Prisma Client...
call npx prisma generate
if errorlevel 1 exit /b 1
echo.

echo 🗄️  Pushing database schema...
call npx prisma db push
if errorlevel 1 exit /b 1
echo.

echo 🌱 Seeding database with initial data...
call npm run prisma:seed
if errorlevel 1 exit /b 1
echo.

echo ✅ Database migration completed successfully!
echo.
echo Next steps:
echo   1. Verify data in Prisma Studio: npx prisma studio
echo   2. Deploy to Vercel: vercel --prod
echo.
