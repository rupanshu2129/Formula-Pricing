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
      effectiveEnd
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

    const model = await prisma.pricingModelTemplate.create({
      data: createData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
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
