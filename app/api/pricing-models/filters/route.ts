import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businessUnits = await prisma.pricingModelTemplate.findMany({
      select: {
        businessUnit: true
      },
      distinct: ['businessUnit']
    })

    const categories = await prisma.pricingModelTemplate.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    })

    return NextResponse.json({ 
      success: true, 
      businessUnits: businessUnits.map(bu => bu.businessUnit),
      categories: categories.map(c => c.category)
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filters' },
      { status: 500 }
    )
  }
}
