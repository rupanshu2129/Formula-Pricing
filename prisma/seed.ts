import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const user = await prisma.user.upsert({
    where: { email: 'system@vap.com' },
    update: {},
    create: {
      id: 'system-user',
      email: 'system@vap.com',
      name: 'System User',
      password: 'hashed_password',
      role: 'ADMIN',
    },
  })

  console.log('Created user:', user.email)

  const customer = await prisma.customer.upsert({
    where: { soldToId: 'CUST001' },
    update: {},
    create: {
      id: 'default-customer',
      soldToId: 'CUST001',
      name: 'Default Customer',
      hierarchy: 'National',
      active: true,
    },
  })

  console.log('Created customer:', customer.name)

  const customer2 = await prisma.customer.upsert({
    where: { soldToId: 'CUST002' },
    update: {},
    create: {
      soldToId: 'CUST002',
      name: 'Premium Foods Inc',
      hierarchy: 'Regional',
      active: true,
    },
  })

  const customer3 = await prisma.customer.upsert({
    where: { soldToId: 'CUST003' },
    update: {},
    create: {
      soldToId: 'CUST003',
      name: 'Standard Distributors LLC',
      hierarchy: 'Local',
      active: true,
    },
  })

  const customer4 = await prisma.customer.upsert({
    where: { soldToId: 'CUST004' },
    update: {},
    create: {
      soldToId: 'CUST004',
      name: 'Global Retail Corp',
      hierarchy: 'National',
      active: true,
    },
  })

  console.log('Created additional customers')

  const premiumSegment = await prisma.segment.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      description: 'High-value customers with premium pricing models',
    },
  })

  const standardSegment = await prisma.segment.upsert({
    where: { name: 'Standard' },
    update: {},
    create: {
      name: 'Standard',
      description: 'Standard customers with regular pricing',
    },
  })

  console.log('Created segments')

  await prisma.customerAssignment.upsert({
    where: {
      id: 'assignment-1'
    },
    update: {},
    create: {
      id: 'assignment-1',
      customerId: customer.id,
      segmentId: standardSegment.id,
      assignedBy: user.id,
    },
  })

  await prisma.customerAssignment.upsert({
    where: {
      id: 'assignment-2'
    },
    update: {},
    create: {
      id: 'assignment-2',
      customerId: customer2.id,
      segmentId: premiumSegment.id,
      assignedBy: user.id,
    },
  })

  console.log('Created customer assignments')

  const template = await prisma.pricingModelTemplate.upsert({
    where: { id: 'default-model' },
    update: {},
    create: {
      id: 'default-model',
      name: 'Standard VAP Pricing Model',
      version: 1,
      businessUnit: 'Protein',
      category: 'Value Added Products',
      outputType: 'FOB',
      currency: 'USD',
      effectiveStart: new Date('2024-01-01'),
      governanceState: 'APPROVED',
      createdById: user.id,
    },
  })

  console.log('Created pricing model template:', template.name)

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template.id,
        type: 'INGREDIENT',
        name: 'Recipe Cost',
        formula: 'SUM(ingredient_price * recipe_percent)',
        isEditable: true,
        sortOrder: 1,
      },
      {
        templateId: template.id,
        type: 'YIELD',
        name: 'Yield Adjustment',
        formula: 'recipe_cost / yield_percent',
        isEditable: false,
        sortOrder: 2,
      },
      {
        templateId: template.id,
        type: 'PACKAGING',
        name: 'Packaging Cost',
        formula: 'packaging_cost',
        isEditable: true,
        sortOrder: 3,
      },
      {
        templateId: template.id,
        type: 'FREIGHT',
        name: 'Freight Cost',
        formula: 'freight_cost',
        isEditable: true,
        sortOrder: 4,
      },
      {
        templateId: template.id,
        type: 'CONVERSION',
        name: 'Conversion Cost',
        formula: 'conversion_cost',
        isEditable: true,
        sortOrder: 5,
      },
      {
        templateId: template.id,
        type: 'REBATE',
        name: 'Rebates',
        formula: 'rebate_amount',
        isEditable: true,
        sortOrder: 6,
      },
      {
        templateId: template.id,
        type: 'TERMS_RATE',
        name: 'Payment Terms',
        formula: 'fob_price * terms_rate / 100',
        isEditable: true,
        sortOrder: 7,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created formula components')

  const template2 = await prisma.pricingModelTemplate.upsert({
    where: { id: 'grain-model' },
    update: {},
    create: {
      id: 'grain-model',
      name: 'Grain Products Pricing Model',
      version: 2,
      businessUnit: 'Grain',
      category: 'Standard',
      outputType: 'DELIVERED',
      currency: 'USD',
      effectiveStart: new Date('2024-02-01'),
      governanceState: 'ACTIVE',
      createdById: user.id,
    },
  })

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template2.id,
        type: 'INGREDIENT',
        name: 'Base Grain Cost',
        formula: 'market_price * quantity',
        isEditable: true,
        sortOrder: 1,
      },
      {
        templateId: template2.id,
        type: 'FREIGHT',
        name: 'Transportation',
        formula: 'distance * rate_per_mile',
        isEditable: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created grain model:', template2.name)

  const template3 = await prisma.pricingModelTemplate.upsert({
    where: { id: 'specialty-model' },
    update: {},
    create: {
      id: 'specialty-model',
      name: 'Specialty Products Model',
      version: 1,
      businessUnit: 'Specialty',
      category: 'Premium',
      outputType: 'BOTH',
      currency: 'USD',
      effectiveStart: new Date('2024-03-01'),
      governanceState: 'DRAFT',
      createdById: user.id,
    },
  })

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template3.id,
        type: 'INGREDIENT',
        name: 'Premium Ingredients',
        formula: 'ingredient_cost * premium_factor',
        isEditable: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created specialty model:', template3.name)

  const template4 = await prisma.pricingModelTemplate.upsert({
    where: { id: 'protein-premium-model' },
    update: {},
    create: {
      id: 'protein-premium-model',
      name: 'Premium Protein Pricing',
      version: 3,
      businessUnit: 'Protein',
      category: 'Premium',
      outputType: 'FOB',
      currency: 'USD',
      effectiveStart: new Date('2024-01-15'),
      governanceState: 'APPROVED',
      createdById: user.id,
    },
  })

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template4.id,
        type: 'INGREDIENT',
        name: 'Premium Recipe Cost',
        formula: 'SUM(premium_ingredient_price * recipe_percent)',
        isEditable: true,
        sortOrder: 1,
      },
      {
        templateId: template4.id,
        type: 'PACKAGING',
        name: 'Premium Packaging',
        formula: 'premium_packaging_cost',
        isEditable: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created premium protein model:', template4.name)

  const template5 = await prisma.pricingModelTemplate.upsert({
    where: { id: 'grain-export-model' },
    update: {},
    create: {
      id: 'grain-export-model',
      name: 'Grain Export Pricing',
      version: 1,
      businessUnit: 'Grain',
      category: 'Export',
      outputType: 'FOB',
      currency: 'USD',
      effectiveStart: new Date('2024-04-01'),
      governanceState: 'DRAFT',
      createdById: user.id,
    },
  })

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template5.id,
        type: 'INGREDIENT',
        name: 'Export Grade Grain',
        formula: 'export_market_price * quantity',
        isEditable: true,
        sortOrder: 1,
      },
      {
        templateId: template5.id,
        type: 'FREIGHT',
        name: 'International Shipping',
        formula: 'container_cost + port_fees',
        isEditable: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created grain export model:', template5.name)

  const template6 = await prisma.pricingModelTemplate.upsert({
    where: { id: 'specialty-organic-model' },
    update: {},
    create: {
      id: 'specialty-organic-model',
      name: 'Organic Specialty Products',
      version: 2,
      businessUnit: 'Specialty',
      category: 'Organic',
      outputType: 'DELIVERED',
      currency: 'USD',
      effectiveStart: new Date('2023-12-01'),
      governanceState: 'ACTIVE',
      createdById: user.id,
    },
  })

  await prisma.formulaComponent.createMany({
    data: [
      {
        templateId: template6.id,
        type: 'INGREDIENT',
        name: 'Organic Ingredients',
        formula: 'organic_ingredient_cost * certification_factor',
        isEditable: true,
        sortOrder: 1,
      },
      {
        templateId: template6.id,
        type: 'PACKAGING',
        name: 'Eco-Friendly Packaging',
        formula: 'sustainable_packaging_cost',
        isEditable: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Created organic specialty model:', template6.name)

  const pricingRun1 = await prisma.pricingRun.upsert({
    where: { runNumber: 'RUN-2024-001' },
    update: {},
    create: {
      runNumber: 'RUN-2024-001',
      templateId: template.id,
      customerId: customer.id,
      pricingPeriodStart: new Date('2024-01-01'),
      pricingPeriodEnd: new Date('2024-01-31'),
      status: 'COMPLETED',
      inputSnapshot: {},
      executedById: user.id,
      createdAt: new Date('2024-01-15'),
    },
  })

  const pricingRun2 = await prisma.pricingRun.upsert({
    where: { runNumber: 'RUN-2024-002' },
    update: {},
    create: {
      runNumber: 'RUN-2024-002',
      templateId: template4.id,
      customerId: customer2.id,
      pricingPeriodStart: new Date('2024-01-01'),
      pricingPeriodEnd: new Date('2024-01-31'),
      status: 'APPROVED',
      inputSnapshot: {},
      executedById: user.id,
      createdAt: new Date('2024-01-15'),
    },
  })

  const pricingRun3 = await prisma.pricingRun.upsert({
    where: { runNumber: 'RUN-2024-003' },
    update: {},
    create: {
      runNumber: 'RUN-2024-003',
      templateId: template6.id,
      customerId: customer3.id,
      pricingPeriodStart: new Date('2024-01-01'),
      pricingPeriodEnd: new Date('2024-01-31'),
      status: 'COMPLETED',
      inputSnapshot: {},
      executedById: user.id,
      createdAt: new Date('2024-01-14'),
    },
  })

  const pricingRun4 = await prisma.pricingRun.upsert({
    where: { runNumber: 'RUN-2024-004' },
    update: {},
    create: {
      runNumber: 'RUN-2024-004',
      templateId: template2.id,
      customerId: customer.id,
      pricingPeriodStart: new Date('2024-01-01'),
      pricingPeriodEnd: new Date('2024-01-31'),
      status: 'CALCULATING',
      inputSnapshot: {},
      executedById: user.id,
      createdAt: new Date('2024-01-16'),
    },
  })

  const pricingRun5 = await prisma.pricingRun.upsert({
    where: { runNumber: 'RUN-2024-005' },
    update: {},
    create: {
      runNumber: 'RUN-2024-005',
      templateId: template5.id,
      customerId: customer2.id,
      pricingPeriodStart: new Date('2024-01-01'),
      pricingPeriodEnd: new Date('2024-01-31'),
      status: 'COMPLETED',
      inputSnapshot: {},
      executedById: user.id,
      createdAt: new Date('2024-01-13'),
    },
  })

  console.log('Created pricing runs')

  const product1 = await prisma.product.upsert({
    where: { materialCode: 'MAT-001' },
    update: {},
    create: {
      materialCode: 'MAT-001',
      name: 'Chicken Breast Fillet',
      uom: 'LB',
      active: true,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { materialCode: 'MAT-002' },
    update: {},
    create: {
      materialCode: 'MAT-002',
      name: 'Chicken Thigh Boneless',
      uom: 'LB',
      active: true,
    },
  })

  const product3 = await prisma.product.upsert({
    where: { materialCode: 'MAT-003' },
    update: {},
    create: {
      materialCode: 'MAT-003',
      name: 'Chicken Wings',
      uom: 'LB',
      active: true,
    },
  })

  console.log('Created products')

  await prisma.pricingRunProduct.deleteMany({
    where: {
      runId: {
        in: [pricingRun1.id, pricingRun2.id, pricingRun3.id, pricingRun5.id],
      },
    },
  })

  await prisma.pricingRunProduct.createMany({
    data: [
      {
        runId: pricingRun1.id,
        productId: product1.id,
        preYieldSubtotal: 2.50,
        postYieldSubtotal: 2.75,
        fobPrice: 3.25,
        totalFOB: 3.50,
        deliveredPrice: 3.75,
      },
      {
        runId: pricingRun1.id,
        productId: product2.id,
        preYieldSubtotal: 2.00,
        postYieldSubtotal: 2.20,
        fobPrice: 2.75,
        totalFOB: 3.00,
        deliveredPrice: 3.25,
      },
      {
        runId: pricingRun2.id,
        productId: product1.id,
        preYieldSubtotal: 2.60,
        postYieldSubtotal: 2.85,
        fobPrice: 3.35,
        totalFOB: 3.60,
        deliveredPrice: 3.85,
      },
      {
        runId: pricingRun3.id,
        productId: product3.id,
        preYieldSubtotal: 1.80,
        postYieldSubtotal: 2.00,
        fobPrice: 2.50,
        totalFOB: 2.75,
        deliveredPrice: 3.00,
      },
      {
        runId: pricingRun5.id,
        productId: product1.id,
        preYieldSubtotal: 2.55,
        postYieldSubtotal: 2.80,
        fobPrice: 3.30,
        totalFOB: 3.55,
        deliveredPrice: 3.80,
      },
      {
        runId: pricingRun5.id,
        productId: product2.id,
        preYieldSubtotal: 2.05,
        postYieldSubtotal: 2.25,
        fobPrice: 2.80,
        totalFOB: 3.05,
        deliveredPrice: 3.30,
      },
    ],
  })

  console.log('Created pricing run products')

  await prisma.refreshRule.create({
    data: {
      templateId: template4.id,
      targetType: 'TEMPLATE',
      owner: user.email,
      frequency: 'WEEKLY',
      nextRefresh: new Date('2024-01-20'),
    },
  })

  await prisma.refreshRule.create({
    data: {
      templateId: template2.id,
      targetType: 'TEMPLATE',
      owner: user.email,
      frequency: 'MONTHLY',
      nextRefresh: new Date('2024-01-12'),
    },
  })

  await prisma.refreshRule.create({
    data: {
      templateId: template3.id,
      targetType: 'TEMPLATE',
      owner: user.email,
      frequency: 'WEEKLY',
      nextRefresh: new Date('2024-01-18'),
    },
  })

  await prisma.refreshRule.create({
    data: {
      templateId: template6.id,
      targetType: 'TEMPLATE',
      owner: user.email,
      frequency: 'DAILY',
      nextRefresh: new Date('2024-01-22'),
    },
  })

  console.log('Created refresh rules')

  await prisma.importHistory.create({
    data: {
      fileName: 'External_Pricing_Jan2024.xlsx',
      fileSize: 245760,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedById: user.id,
      status: 'SUCCESS',
      recordsProcessed: 150,
      recordsSuccess: 150,
      recordsFailed: 0,
      startedAt: new Date('2024-01-15T09:00:00'),
      completedAt: new Date('2024-01-15T09:02:30'),
      createdAt: new Date('2024-01-15T09:00:00'),
    },
  })

  await prisma.importHistory.create({
    data: {
      fileName: 'Customer_Pricing_Update.xlsx',
      fileSize: 189440,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedById: user.id,
      status: 'FAILED',
      recordsProcessed: 75,
      recordsSuccess: 0,
      recordsFailed: 75,
      errorDetails: {
        errors: [
          { row: 5, column: 'Price', error: 'Price must be a valid number', value: 'ABC' },
          { row: 12, column: 'Customer ID', error: 'Required field is empty' },
          { row: 18, column: 'Material Code', error: 'Material code not found in system', value: 'MAT-999' },
        ],
      },
      startedAt: new Date('2024-01-14T14:30:00'),
      completedAt: new Date('2024-01-14T14:31:45'),
      createdAt: new Date('2024-01-14T14:30:00'),
    },
  })

  await prisma.importHistory.create({
    data: {
      fileName: 'Q1_Pricing_Data.xlsx',
      fileSize: 312320,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedById: user.id,
      status: 'SUCCESS',
      recordsProcessed: 200,
      recordsSuccess: 200,
      recordsFailed: 0,
      startedAt: new Date('2024-01-13T11:15:00'),
      completedAt: new Date('2024-01-13T11:18:20'),
      createdAt: new Date('2024-01-13T11:15:00'),
    },
  })

  await prisma.importHistory.create({
    data: {
      fileName: 'Freight_Rates_Update.xlsx',
      fileSize: 156672,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedById: user.id,
      status: 'PARTIAL',
      recordsProcessed: 120,
      recordsSuccess: 115,
      recordsFailed: 5,
      errorDetails: {
        errors: [
          { row: 45, column: 'Rate', error: 'Rate exceeds maximum allowed value' },
          { row: 67, column: 'Origin', error: 'Invalid location code' },
        ],
      },
      startedAt: new Date('2024-01-12T16:45:00'),
      completedAt: new Date('2024-01-12T16:47:15'),
      createdAt: new Date('2024-01-12T16:45:00'),
    },
  })

  await prisma.importHistory.create({
    data: {
      fileName: 'Corn_Market_Indicators.xlsx',
      fileSize: 98304,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedById: user.id,
      status: 'SUCCESS',
      recordsProcessed: 50,
      recordsSuccess: 50,
      recordsFailed: 0,
      startedAt: new Date('2024-01-11T08:30:00'),
      completedAt: new Date('2024-01-11T08:31:10'),
      createdAt: new Date('2024-01-11T08:30:00'),
    },
  })

  console.log('Created import history records')

  await prisma.exportArtifact.deleteMany({
    where: {
      runId: {
        in: [pricingRun1.id, pricingRun2.id, pricingRun3.id, pricingRun5.id],
      },
    },
  })

  await prisma.exportArtifact.create({
    data: {
      runId: pricingRun1.id,
      type: 'SAP',
      fileName: 'SAP_Upload_RUN-2024-001.xlsx',
      fileSize: 45678,
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-15T11:00:00'),
      createdAt: new Date('2024-01-15T10:30:00'),
    },
  })

  await prisma.exportArtifact.create({
    data: {
      runId: pricingRun2.id,
      type: 'EXCEL',
      fileName: 'Customer_Pricing_RUN-2024-002.xlsx',
      fileSize: 32456,
      status: 'GENERATED',
      createdAt: new Date('2024-01-15T09:15:00'),
    },
  })

  await prisma.exportArtifact.create({
    data: {
      runId: pricingRun3.id,
      type: 'SAP',
      fileName: 'SAP_Upload_RUN-2024-003.xlsx',
      fileSize: 51234,
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-14T15:00:00'),
      createdAt: new Date('2024-01-14T14:20:00'),
    },
  })

  await prisma.exportArtifact.create({
    data: {
      runId: pricingRun5.id,
      type: 'EXCEL',
      fileName: 'Customer_Pricing_RUN-2024-005.xlsx',
      fileSize: 28900,
      status: 'GENERATED',
      createdAt: new Date('2024-01-13T16:45:00'),
    },
  })

  console.log('Created export artifacts')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
