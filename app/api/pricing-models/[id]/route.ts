import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = await prisma.pricingModelTemplate.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        components: {
          orderBy: { sortOrder: 'asc' }
        },
        segment: {
          select: {
            name: true,
            description: true
          }
        }
      }
    })

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, model })
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch model' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, businessUnit, category, bucket, outputType, currency, effectiveStart, effectiveEnd } = body

    const updateData: any = {
      name,
      businessUnit,
      category,
      outputType,
      currency,
      effectiveStart: new Date(effectiveStart),
    }

    if (bucket) {
      updateData.bucket = bucket
    }

    if (effectiveEnd) {
      updateData.effectiveEnd = new Date(effectiveEnd)
    }

    const model = await prisma.pricingModelTemplate.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, model })
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update model' },
      { status: 500 }
    )
  }
}
