import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    
    const refreshRules = await prisma.refreshRule.findMany({
      where: {
        OR: [
          {
            nextRefresh: {
              lt: now
            }
          },
          {
            nextRefresh: {
              gte: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        ]
      },
      include: {
        template: {
          select: {
            name: true,
            version: true
          }
        }
      },
      orderBy: { nextRefresh: 'asc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      alerts: refreshRules.map(rule => ({
        model: `${rule.template.name} v${rule.template.version}`,
        dueDate: rule.nextRefresh.toISOString().split('T')[0],
        overdue: rule.nextRefresh < now
      }))
    })
  } catch (error) {
    console.error('Error fetching refresh alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refresh alerts' },
      { status: 500 }
    )
  }
}
