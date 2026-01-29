import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const run = await prisma.pricingRun.findUnique({
      where: { id },
      include: {
        template: true,
        customer: true,
        products: {
          include: {
            product: true,
          },
        },
        executedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json(
        { success: false, error: 'Pricing run not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      run: {
        ...run,
        modelTemplate: run.template,
      }
    })
  } catch (error) {
    console.error('Error fetching pricing run:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing run' },
      { status: 500 }
    )
  }
}
