import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRunNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer, 
      model, 
      periodStart, 
      periodEnd, 
      ingredients, 
      yield: yieldValue,
      packaging,
      freight,
      conversion,
      rebates,
      termsRate,
      calculatedPrice 
    } = body

    const runNumber = generateRunNumber()

    const pricingRun = await prisma.pricingRun.create({
      data: {
        runNumber,
        templateId: model || 'default-model',
        customerId: customer || 'default-customer',
        pricingPeriodStart: new Date(periodStart),
        pricingPeriodEnd: new Date(periodEnd),
        status: 'DRAFT',
        inputSnapshot: {
          ingredients,
          yield: yieldValue,
          packaging,
          freight,
          conversion,
          rebates,
          termsRate
        },
        outputSnapshot: calculatedPrice,
        executedById: 'system-user',
      }
    })

    return NextResponse.json({ 
      success: true, 
      runNumber: pricingRun.runNumber,
      id: pricingRun.id 
    })
  } catch (error) {
    console.error('Error saving pricing run:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save pricing run' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const runs = await prisma.pricingRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        template: true,
        customer: true,
      }
    })

    return NextResponse.json({ success: true, runs })
  } catch (error) {
    console.error('Error fetching pricing runs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing runs' },
      { status: 500 }
    )
  }
}
