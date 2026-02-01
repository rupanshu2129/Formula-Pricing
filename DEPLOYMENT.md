# Database Migration Guide for Vercel Deployment

This guide will help you migrate your database tables and data to production for your Vercel deployment.

## Option 1: Using Vercel Postgres (Recommended for Quick Setup)

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose your region (select closest to your users)
6. Click **Create**

### Step 2: Connect Database to Your Project

1. After creation, Vercel will automatically add the `DATABASE_URL` environment variable
2. The connection string will be available in your project's environment variables
3. Vercel will automatically inject this into your deployment

### Step 3: Run Migrations

You have two options to run migrations:

#### Option A: Using Vercel CLI (Recommended)

```bash
cd vap-pricing-portal

vercel env pull .env.local

npm install

npx prisma generate

npx prisma db push

npm run prisma:seed
```

#### Option B: Using Prisma Studio Locally

```bash
cd vap-pricing-portal

vercel env pull .env.local

npm install

npx prisma generate

npx prisma migrate deploy

npm run prisma:seed
```

### Step 4: Verify Deployment

1. Redeploy your application: `vercel --prod`
2. Check the deployment logs for any database connection errors
3. Test your application to ensure data is accessible

---

## Option 2: Using External PostgreSQL Database (Neon, Supabase, Railway, etc.)

### Step 1: Create PostgreSQL Database

Choose one of these providers:

#### Neon (Recommended - Serverless Postgres)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use "Connection pooling" for better performance)

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection string

### Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

Example connection string format:
```
postgresql://username:password@host:5432/database?sslmode=require
```

### Step 3: Run Migrations on Production Database

#### Method 1: From Local Machine

```bash
cd vap-pricing-portal

export DATABASE_URL="your-production-database-url"

npx prisma generate

npx prisma db push

npm run prisma:seed
```

#### Method 2: Using Vercel Build Hook

Add a `postbuild` script to run migrations automatically:

Edit `package.json`:
```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

**Note**: This will run migrations on every deployment. Use with caution.

### Step 4: Verify Connection

```bash
cd vap-pricing-portal

export DATABASE_URL="your-production-database-url"

npx prisma studio
```

This will open Prisma Studio where you can verify your data.

---

## Option 3: Migrate Existing Local Data to Production

If you have existing data in your local database that you want to migrate:

### Step 1: Export Data from Local Database

```bash
cd vap-pricing-portal

pg_dump -h localhost -U your_username -d vap_pricing -f backup.sql
```

Or use Prisma to export:

```bash
npx prisma db pull
```

### Step 2: Import Data to Production Database

```bash
psql "your-production-database-url" < backup.sql
```

Or use a database migration tool like:
- [pgloader](https://pgloader.io/)
- [pg_dump and pg_restore](https://www.postgresql.org/docs/current/backup-dump.html)

---

## Database Schema Overview

Your application uses the following main tables:

- **User** - User accounts with roles (ADMIN, STRATEGIC_PRICING, etc.)
- **Customer** - Customer information with sold-to and ship-to IDs
- **Segment** - Customer segments for pricing models
- **Product** - Product catalog with material codes
- **PricingModelTemplate** - Pricing model templates with governance
- **FormulaComponent** - Formula components for pricing calculations
- **PricingRun** - Pricing calculation runs
- **MarketIndicator** - Market indicators for pricing
- **AuditLog** - Audit trail for all changes

---

## Seed Data

The seed script (`prisma/seed.ts`) creates:

- System admin user
- Sample customers (4 customers)
- Customer segments (Premium, Standard)
- Pricing model templates (3 templates)
- Formula components for each template
- Sample products
- Market indicators

To customize seed data, edit `vap-pricing-portal/prisma/seed.ts` before running.

---

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check that `DATABASE_URL` is correctly set in Vercel
2. Verify the database allows connections from Vercel's IP ranges
3. Ensure SSL is enabled (add `?sslmode=require` to connection string)
4. Check database credentials are correct

### Migration Errors

If migrations fail:

```bash
npx prisma migrate reset

npx prisma db push

npm run prisma:seed
```

**Warning**: This will delete all data!

### Prisma Client Issues

If you get "Prisma Client not generated" errors:

```bash
npx prisma generate
```

Make sure this runs in your build process (already included in `build` script).

---

## Security Best Practices

1. **Never commit** `.env` files with production credentials
2. Use **environment variables** in Vercel for all secrets
3. Enable **SSL/TLS** for database connections
4. Use **connection pooling** for better performance (Prisma Accelerate or PgBouncer)
5. Set up **database backups** (most providers offer automatic backups)
6. Use **read replicas** for high-traffic applications (optional)

---

## Performance Optimization

### Connection Pooling

For serverless environments like Vercel, use connection pooling:

1. **Prisma Data Proxy** (Prisma Accelerate)
2. **PgBouncer** (if using external database)
3. **Supabase Connection Pooling** (if using Supabase)

Update your `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Indexing

The schema already includes indexes on frequently queried fields. Monitor query performance and add more indexes as needed.

---

## Monitoring

### Database Monitoring

1. **Vercel Postgres**: Built-in monitoring in Vercel dashboard
2. **Neon**: Monitoring dashboard with query insights
3. **Supabase**: Database statistics and query performance

### Application Monitoring

Monitor database queries in your application:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

---

## Next Steps

After successful migration:

1. ✅ Test all application features
2. ✅ Verify user authentication works
3. ✅ Check pricing calculations are correct
4. ✅ Test data imports/exports
5. ✅ Set up database backups
6. ✅ Configure monitoring and alerts
7. ✅ Document any custom configurations

---

## Quick Reference Commands

```bash
vercel env pull .env.local

npx prisma generate

npx prisma db push

npx prisma migrate deploy

npm run prisma:seed

npx prisma studio

vercel --prod
```

---

## Support

For issues:
- Vercel Postgres: [Vercel Support](https://vercel.com/support)
- Neon: [Neon Docs](https://neon.tech/docs)
- Supabase: [Supabase Docs](https://supabase.com/docs)
- Prisma: [Prisma Docs](https://www.prisma.io/docs)
