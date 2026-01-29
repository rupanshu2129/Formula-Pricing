import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const importHistory = await prisma.importHistory.findMany({
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const historyItems = importHistory.map(item => ({
      id: item.id,
      fileName: item.fileName,
      uploadedAt: item.createdAt.toISOString(),
      uploadedBy: item.uploadedBy.name,
      status: item.status,
      recordsProcessed: item.recordsProcessed,
      recordsSuccess: item.recordsSuccess,
      recordsFailed: item.recordsFailed,
      errorDetails: item.errorDetails,
      duration: item.completedAt 
        ? Math.round((item.completedAt.getTime() - item.startedAt.getTime()) / 1000)
        : null
    }))

    return NextResponse.json({
      success: true,
      history: historyItems
    })
  } catch (error) {
    console.error('Error fetching import history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch import history' },
      { status: 500 }
    )
  }
}
