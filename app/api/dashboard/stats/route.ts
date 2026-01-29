import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activeModels = await prisma.pricingModelTemplate.count({
      where: { governanceState: 'ACTIVE' }
    })

    const pendingApprovals = await prisma.pricingModelTemplate.count({
      where: { 
        governanceState: {
          in: ['DRAFT', 'PEER_REVIEW', 'FINANCE_REVIEW']
        }
      }
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const pricingRunsThisWeek = await prisma.pricingRun.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const pricingRunsLastWeek = await prisma.pricingRun.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo
        }
      }
    })

    const percentageChange = pricingRunsLastWeek > 0 
      ? Math.round(((pricingRunsThisWeek - pricingRunsLastWeek) / pricingRunsLastWeek) * 100)
      : 0

    const overdueRefreshes = await prisma.refreshRule.count({
      where: {
        nextRefresh: {
          lt: new Date()
        }
      }
    })

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const modelsCreatedThisMonth = await prisma.pricingModelTemplate.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        activeModels: {
          value: activeModels,
          change: `+${modelsCreatedThisMonth} this month`
        },
        pendingApprovals: {
          value: pendingApprovals,
          change: pendingApprovals > 0 ? 'Requires attention' : 'All clear'
        },
        pricingRunsThisWeek: {
          value: pricingRunsThisWeek,
          change: `${percentageChange >= 0 ? '+' : ''}${percentageChange}% vs last week`
        },
        overdueRefreshes: {
          value: overdueRefreshes,
          change: overdueRefreshes > 0 ? 'Action required' : 'Up to date'
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
