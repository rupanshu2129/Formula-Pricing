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
    const {
      name,
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

    if (ingredients || additionalFactors) {
      await prisma.formulaComponent.deleteMany({
        where: { templateId: params.id }
      })

      const componentsToCreate = []
      let sortOrder = 0

      if (ingredients && ingredients.length > 0) {
        ingredients.forEach((ing: any) => {
          componentsToCreate.push({
            type: 'INGREDIENT',
            name: ing.name,
            formula: 'INGREDIENT',
            parameters: {
              recipePercent: ing.recipePercent,
              marketPrice: ing.marketPrice,
            },
            sortOrder: sortOrder++,
          })
        })
      }

      if (additionalFactors) {
        if (additionalFactors.yield !== undefined) {
          componentsToCreate.push({
            type: 'YIELD',
            name: 'Yield',
            formula: 'YIELD',
            parameters: { value: additionalFactors.yield },
            sortOrder: sortOrder++,
          })
        }
        if (additionalFactors.packaging !== undefined) {
          componentsToCreate.push({
            type: 'PACKAGING',
            name: 'Packaging',
            formula: 'PACKAGING',
            parameters: { value: additionalFactors.packaging },
            sortOrder: sortOrder++,
          })
        }
        if (additionalFactors.freight !== undefined) {
          componentsToCreate.push({
            type: 'FREIGHT',
            name: 'Freight',
            formula: 'FREIGHT',
            parameters: { value: additionalFactors.freight },
            sortOrder: sortOrder++,
          })
        }
        if (additionalFactors.conversion !== undefined) {
          componentsToCreate.push({
            type: 'CONVERSION',
            name: 'Conversion',
            formula: 'CONVERSION',
            parameters: { value: additionalFactors.conversion },
            sortOrder: sortOrder++,
          })
        }
        if (additionalFactors.rebates !== undefined) {
          componentsToCreate.push({
            type: 'REBATE',
            name: 'Rebates',
            formula: 'REBATE',
            parameters: { value: additionalFactors.rebates },
            sortOrder: sortOrder++,
          })
        }
        if (additionalFactors.paymentTermsRate !== undefined) {
          componentsToCreate.push({
            type: 'TERMS_RATE',
            name: 'Payment Terms Rate',
            formula: 'TERMS_RATE',
            parameters: { value: additionalFactors.paymentTermsRate },
            sortOrder: sortOrder++,
          })
        }
      }

      if (componentsToCreate.length > 0) {
        updateData.components = {
          create: componentsToCreate
        }
      }
    }

    const model = await prisma.pricingModelTemplate.update({
      where: { id: params.id },
      data: updateData,
      include: {
        components: {
          orderBy: { sortOrder: 'asc' }
        }
      }
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
