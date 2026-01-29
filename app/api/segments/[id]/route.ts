import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segment = await prisma.segment.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: {
            customer: true
          }
        }
      }
    })

    if (!segment) {
      return NextResponse.json(
        { success: false, error: 'Segment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, segment })
  } catch (error) {
    console.error('Error fetching segment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch segment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Segment name is required' },
        { status: 400 }
      )
    }

    const existingSegment = await prisma.segment.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: params.id }
      }
    })

    if (existingSegment) {
      return NextResponse.json(
        { success: false, error: 'A segment with this name already exists' },
        { status: 400 }
      )
    }

    const segment = await prisma.segment.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({ success: true, segment })
  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update segment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customerAssignment.deleteMany({
      where: { segmentId: params.id }
    })

    await prisma.segment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting segment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete segment' },
      { status: 500 }
    )
  }
}
