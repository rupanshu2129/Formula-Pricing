import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recentRuns = await prisma.pricingRun.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      runs: recentRuns.map(run => ({
        id: run.runNumber,
        customer: run.customer.name,
        date: run.createdAt.toISOString().split('T')[0],
        status: run.status
      }))
    })
  } catch (error) {
    console.error('Error fetching recent runs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent runs' },
      { status: 500 }
    )
  }
}
