# VAP Formula Pricing Portal

A comprehensive Next.js application for managing formula-based pricing with governance, execution, and audit capabilities.

## Overview

The VAP Formula Pricing Portal is designed to replace manual Excel-based pricing processes with an automated, auditable, and governed system. It separates pricing logic definition from execution, ensuring accurate and explainable pricing decisions.

## Key Features

### Module 1: Strategic Pricing (Model Setup & Governance)
- **Pricing Model Templates**: Create reusable formula templates by bucket/category
- **Formula Definition**: Support for ingredient costs, yield adjustments, packaging, freight, conversion fees, rebates, and terms rates
- **Approval Workflow**: Multi-step approval process (Draft → Peer Review → Finance Review → Approved → Active)
- **Customer-Level Overrides**: Allow customer-specific component adjustments
- **Version Control**: Track model versions and changes over time

### Module 2: Price Execution (Run Pricing & Publish)
- **Pricing Runs**: Execute approved models with permitted inputs only
- **Real-time Calculation**: Compute pre-yield, post-yield, FOB, and total FOB prices
- **Explainability**: Component-by-component breakdown showing contribution and source
- **Run History**: Auditable record of all pricing executions
- **Compare Runs**: Variance analysis across time periods

### Additional Features
- **Dashboard**: Overview with stats, recent runs, and refresh alerts
- **Customer Grouping**: Segment management and customer assignments
- **Export Management**: Generate SAP uploads and Excel files for customers
- **Import Validation**: Upload and validate external pricing files with strict error checking
- **Refresh Calendar**: Automated prompts for model and input refreshes
- **Audit Logging**: Complete trail of who changed what and when

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Tailwind CSS with custom components
- **Authentication**: NextAuth.js (ready for implementation)
- **Excel Processing**: ExcelJS and XLSX libraries
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
```bash
cd vap-pricing-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vap_pricing"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Quick Start

For detailed deployment instructions, see [QUICKSTART.md](./QUICKSTART.md)

**TL;DR:**

1. **Create Database**:
   - Option A: Vercel Postgres (easiest)
   - Option B: External provider (Neon, Supabase, Railway)

2. **Set Environment Variable**:
   ```bash
   vercel env add DATABASE_URL
   ```

3. **Run Migration**:
   ```bash
   vercel env pull .env.local
   ./scripts/migrate-db.sh  # or scripts\migrate-db.bat on Windows
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Detailed Deployment Guide

For comprehensive deployment instructions including:
- Database provider comparisons
- Migration strategies
- Troubleshooting
- Security best practices
- Performance optimization

See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Project Structure

```
vap-pricing-portal/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard
│   ├── models/              # Model Builder (Module 1)
│   ├── pricing-runs/        # Price Execution (Module 2)
│   ├── customers/           # Customer Grouping
│   ├── exports/             # Export Management
│   ├── imports/             # Import Validation
│   └── calendar/            # Refresh Calendar
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── navigation.tsx       # Main navigation
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Database client
│   ├── pricing-engine.ts   # Pricing calculation logic
│   ├── export-service.ts   # SAP and Excel export generation
│   ├── import-service.ts   # File validation
│   ├── audit-service.ts    # Audit logging
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript type definitions
├── prisma/                  # Database schema
│   ├── schema.prisma       # Prisma data models
│   └── seed.ts             # Database seed data
├── scripts/                 # Deployment scripts
│   ├── migrate-db.sh       # Database migration (Unix)
│   └── migrate-db.bat      # Database migration (Windows)
└── public/                  # Static assets
```

## Data Model

### Core Entities

- **User**: System users with role-based access (Strategic Pricing, Price Execution, Sales, Admin, Audit/Finance)
- **Customer**: Customer master with sold-to/ship-to IDs and segment assignments
- **Segment**: Customer grouping with default models and refresh cadences
- **Product**: Material master with UOM and market indicator mappings
- **MarketIndicator**: External market data with update frequency and history
- **PricingModelTemplate**: Formula templates with governance state and versioning
- **FormulaComponent**: Individual formula components (ingredients, yield, packaging, etc.)
- **PricingRun**: Execution records with input/output snapshots
- **ExportArtifact**: Generated SAP and Excel exports
- **AuditLog**: Complete audit trail of all changes

## Pricing Calculation Formula

The system implements the following pricing formula:

1. **Pre-Yield Subtotal** = Σ (Recipe% × Cost per lb) for all ingredients
2. **Post-Yield Subtotal** = Pre-Yield Subtotal / (Yield% / 100)
3. **FOB Price** = Post-Yield Subtotal + Packaging + Freight + Conversion - Rebates
4. **Total FOB** = FOB Price × (1 + Terms Rate%)

Each component is tracked with its source (user-entered, system-derived, or market-based) for full explainability.

## User Roles & Permissions

- **Strategic Pricing (SP)**: Define and approve models, manage governance
- **Price Execution (PE)**: Run approved models, enter permitted inputs only
- **Sales**: View-only access to outputs and exports
- **Admin**: Manage master data, permissions, integrations
- **Audit/Finance**: Read-only access to run history and approvals

## Key Workflows

### Creating a Pricing Model
1. Strategic Pricing creates a new model template
2. Define formula components and permitted inputs
3. Set customer assignments and overrides
4. Submit for peer review
5. Optional finance review
6. Approve and activate

### Running Pricing
1. Price Execution selects approved model and customer
2. Enter permitted inputs (system auto-fills locked values)
3. Calculate price with real-time breakdown
4. Review explainability view
5. Save run with immutable snapshot
6. Generate exports (SAP and/or Excel)

### Import External Files
1. Upload Excel file with pricing data
2. System validates required columns and formatting
3. Row-level error reporting for any issues
4. Successful imports become reference data

## Export Formats

### SAP Export
- Customer ID, Material Code, FOB Price, Total FOB, Delivered Price
- Valid From/To dates, Currency, UOM
- Ready for direct SAP upload

### Excel Export (Customer Communication)
- Formatted pricing sheet with company branding
- Customer details and pricing period
- Product-level breakdown with all price components
- Suitable for external distribution

## Refresh Calendar

The system tracks refresh schedules at two levels:
- **Model Level**: Weekly, monthly, quarterly, or annual refresh
- **Input Level**: Daily to annual refresh for market indicators and cost inputs

Automated notifications alert owners when refreshes are due or overdue.

## Security & Compliance

- Role-based access control (RBAC)
- Segregation of duties (SP define/approve, PE execute)
- Full audit trail for all changes
- Approval gates before SAP publish
- Immutable run snapshots
- Data versioning for traceability

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with sample data

### Adding New Features

1. Define data models in `prisma/schema.prisma`
2. Create API routes in `app/api/`
3. Build UI components in `components/`
4. Add pages in `app/`
5. Update types in `types/`

## Future Enhancements

- [ ] Direct SAP integration (auto-publish)
- [ ] Advanced analytics and reporting
- [ ] Machine learning for price optimization
- [ ] Mobile app for Sales team
- [ ] Real-time market data feeds
- [ ] Multi-currency support
- [ ] Batch pricing for large customer sets
- [ ] What-if scenario analysis

## Support

For questions or issues, contact the development team or refer to the internal documentation.

## License

Internal use only - Cargill VAP Division
