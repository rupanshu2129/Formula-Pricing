import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    
    const refreshRules = await prisma.refreshRule.findMany({
      include: {
        template: {
          select: {
            name: true,
            version: true
          }
        }
      },
      orderBy: { nextRefresh: 'asc' }
    })

    const scheduleItems = refreshRules.map(rule => {
      const nextRefresh = new Date(rule.nextRefresh)
      const lastRefresh = rule.lastRefresh ? new Date(rule.lastRefresh) : null
      
      let status = 'Upcoming'
      if (nextRefresh < now) {
        status = 'Overdue'
      } else if (nextRefresh.toDateString() === now.toDateString()) {
        status = 'Due Today'
      }

      return {
        id: rule.id,
        type: rule.targetType === 'TEMPLATE' ? 'Model' : 'Input',
        name: `${rule.template.name} v${rule.template.version}`,
        frequency: rule.frequency.charAt(0) + rule.frequency.slice(1).toLowerCase(),
        lastRefresh: lastRefresh ? lastRefresh.toISOString().split('T')[0] : 'Never',
        nextRefresh: nextRefresh.toISOString().split('T')[0],
        owner: rule.owner,
        status
      }
    })

    const stats = {
      overdue: scheduleItems.filter(item => item.status === 'Overdue').length,
      dueToday: scheduleItems.filter(item => item.status === 'Due Today').length,
      upcoming: scheduleItems.filter(item => item.status === 'Upcoming').length
    }

    return NextResponse.json({
      success: true,
      schedule: scheduleItems,
      stats
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
