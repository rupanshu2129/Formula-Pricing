import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const exportArtifacts = await prisma.exportArtifact.findMany({
      include: {
        run: {
          include: {
            customer: {
              select: {
                name: true,
                soldToId: true
              }
            },
            template: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const exports = exportArtifacts.map(artifact => ({
      id: artifact.id,
      runId: artifact.runId,
      type: artifact.type,
      fileName: artifact.fileName,
      filePath: artifact.filePath,
      fileSize: artifact.fileSize,
      customer: artifact.run.customer?.name || 'Unknown',
      customerId: artifact.run.customer?.soldToId || '',
      model: artifact.run.template?.name || 'Unknown',
      status: artifact.status,
      createdAt: artifact.createdAt.toISOString(),
      publishedAt: artifact.publishedAt?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      exports
    })
  } catch (error) {
    console.error('Error fetching exports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exports' },
      { status: 500 }
    )
  }
}
