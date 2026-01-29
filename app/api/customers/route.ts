import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        soldToId: true,
        name: true,
      }
    })

    return NextResponse.json({ success: true, customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
