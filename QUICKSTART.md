# Quick Start: Database Migration to Vercel

This guide provides the fastest way to get your database running in production.

## Prerequisites

- Vercel account with deployed application
- Vercel CLI installed: `npm i -g vercel`
- Node.js and npm installed

## Step-by-Step Guide

### 1. Choose Your Database Provider

**Option A: Vercel Postgres (Easiest)**
- Go to your Vercel project → Storage → Create Database → Postgres
- Vercel automatically configures `DATABASE_URL`

**Option B: External Provider (Neon, Supabase, Railway)**
- Create a PostgreSQL database with your preferred provider
- Copy the connection string

### 2. Set Environment Variable (Skip if using Vercel Postgres)

If using external database:

```bash
vercel env add DATABASE_URL
```

Paste your connection string when prompted.
Select: Production (and Preview if needed)

### 3. Run Migration Script

**On macOS/Linux:**

```bash
cd vap-pricing-portal

vercel env pull .env.local

chmod +x scripts/migrate-db.sh

./scripts/migrate-db.sh
```

**On Windows:**

```bash
cd vap-pricing-portal

vercel env pull .env.local

scripts\migrate-db.bat
```

**Or manually:**

```bash
cd vap-pricing-portal

vercel env pull .env.local

npm install

npx prisma generate

npx prisma db push

npm run prisma:seed
```

### 4. Verify Migration

```bash
npx prisma studio
```

This opens a web interface to view your database. You should see:
- Users table with system user
- Customers table with 4 sample customers
- Segments table with Premium and Standard segments
- PricingModelTemplate table with 3 templates
- And more...

### 5. Deploy to Vercel

```bash
vercel --prod
```

### 6. Test Your Application

Visit your production URL and verify:
- ✅ Login works
- ✅ Customers are visible
- ✅ Pricing models load
- ✅ No database connection errors

## Troubleshooting

### "DATABASE_URL is not set"

```bash
vercel env pull .env.local
```

Check that `.env.local` contains `DATABASE_URL`

### "Connection refused"

- Verify database is running
- Check connection string format
- Ensure SSL is enabled: add `?sslmode=require` to URL

### "Prisma Client not generated"

```bash
npx prisma generate
```

### Migration fails

```bash
npx prisma migrate reset

npx prisma db push

npm run prisma:seed
```

⚠️ **Warning**: This deletes all data!

## What Gets Created

The seed script creates:

### Users
- System admin user (email: system@vap.com)

### Customers
- Default Customer (CUST001)
- Premium Foods Inc (CUST002)
- Standard Distributors LLC (CUST003)
- Global Retail Corp (CUST004)

### Segments
- Premium segment
- Standard segment

### Pricing Models
- Standard VAP Pricing Model (Protein)
- Grain Products Pricing Model
- Specialty Products Model

### Formula Components
- Ingredient costs
- Yield adjustments
- Packaging costs
- Freight costs
- Conversion costs
- Rebates
- Payment terms

### Products
- 10 sample products with material codes

### Market Indicators
- Corn price
- Soybean price
- Wheat price
- Freight index

## Next Steps

1. **Customize seed data**: Edit `prisma/seed.ts`
2. **Add real users**: Use the application's user management
3. **Import customers**: Use the bulk import feature
4. **Configure pricing models**: Set up your actual pricing formulas
5. **Set up backups**: Enable automatic backups in your database provider
6. **Monitor performance**: Check database metrics in your provider's dashboard

## Production Checklist

- [ ] Database created and accessible
- [ ] `DATABASE_URL` configured in Vercel
- [ ] Migrations run successfully
- [ ] Seed data loaded
- [ ] Application deployed to Vercel
- [ ] Login tested
- [ ] Data visible in application
- [ ] Backups configured
- [ ] Monitoring set up

## Support

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For issues:
- Vercel: https://vercel.com/support
- Prisma: https://www.prisma.io/docs
- Database providers: Check their documentation
