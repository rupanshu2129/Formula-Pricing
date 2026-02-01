import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const businessUnit = searchParams.get('businessUnit')
    const status = searchParams.get('status')

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (businessUnit) {
      where.businessUnit = businessUnit
    }

    if (status) {
      where.governanceState = status.toUpperCase()
    }

    const models = await prisma.pricingModelTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        version: true,
        businessUnit: true,
        category: true,
        governanceState: true,
        effectiveStart: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      version,
      businessUnit,
      category,
      bucket,
      outputType,
      currency,
      effectiveStart,
      effectiveEnd,
      ingredients,
      additionalFactors
    } = body

    const createData: any = {
      name,
      version,
      businessUnit,
      category,
      outputType,
      currency,
      effectiveStart: new Date(effectiveStart),
      governanceState: 'DRAFT',
      createdById: 'system-user',
    }

    if (bucket) {
      createData.bucket = bucket
    }

    if (effectiveEnd) {
      createData.effectiveEnd = new Date(effectiveEnd)
    }

    if (ingredients && ingredients.length > 0) {
      createData.components = {
        create: [
          ...ingredients.map((ing: any, index: number) => ({
            type: 'INGREDIENT',
            name: ing.name,
            formula: 'INGREDIENT',
            parameters: {
              recipePercent: ing.recipePercent,
              marketPrice: ing.marketPrice,
            },
            sortOrder: index,
          })),
        ]
      }
    }

    if (additionalFactors) {
      const additionalComponents = []
      let sortOrder = ingredients?.length || 0

      if (additionalFactors.yield !== undefined) {
        additionalComponents.push({
          type: 'YIELD',
          name: 'Yield',
          formula: 'YIELD',
          parameters: { value: additionalFactors.yield },
          sortOrder: sortOrder++,
        })
      }
      if (additionalFactors.packaging !== undefined) {
        additionalComponents.push({
          type: 'PACKAGING',
          name: 'Packaging',
          formula: 'PACKAGING',
          parameters: { value: additionalFactors.packaging },
          sortOrder: sortOrder++,
        })
      }
      if (additionalFactors.freight !== undefined) {
        additionalComponents.push({
          type: 'FREIGHT',
          name: 'Freight',
          formula: 'FREIGHT',
          parameters: { value: additionalFactors.freight },
          sortOrder: sortOrder++,
        })
      }
      if (additionalFactors.conversion !== undefined) {
        additionalComponents.push({
          type: 'CONVERSION',
          name: 'Conversion',
          formula: 'CONVERSION',
          parameters: { value: additionalFactors.conversion },
          sortOrder: sortOrder++,
        })
      }
      if (additionalFactors.rebates !== undefined) {
        additionalComponents.push({
          type: 'REBATE',
          name: 'Rebates',
          formula: 'REBATE',
          parameters: { value: additionalFactors.rebates },
          sortOrder: sortOrder++,
        })
      }
      if (additionalFactors.paymentTermsRate !== undefined) {
        additionalComponents.push({
          type: 'TERMS_RATE',
          name: 'Payment Terms Rate',
          formula: 'TERMS_RATE',
          parameters: { value: additionalFactors.paymentTermsRate },
          sortOrder: sortOrder++,
        })
      }

      if (createData.components) {
        createData.components.create.push(...additionalComponents)
      } else {
        createData.components = { create: additionalComponents }
      }
    }

    const model = await prisma.pricingModelTemplate.create({
      data: createData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        components: true
      }
    })

    return NextResponse.json({ success: true, model })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
