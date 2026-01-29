import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const segments = await prisma.segment.findMany({
      include: {
        assignments: {
          include: {
            customer: true
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedSegments = segments.map(segment => ({
      id: segment.id,
      name: segment.name,
      description: segment.description,
      customerCount: segment._count.assignments,
      customers: segment.assignments.map(a => ({
        id: a.customer.id,
        name: a.customer.name,
        soldToId: a.customer.soldToId
      })),
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt
    }))

    return NextResponse.json({ success: true, segments: formattedSegments })
  } catch (error) {
    console.error('Error fetching segments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch segments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingSegment) {
      return NextResponse.json(
        { success: false, error: 'A segment with this name already exists' },
        { status: 400 }
      )
    }

    const segment = await prisma.segment.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({ success: true, segment })
  } catch (error) {
    console.error('Error creating segment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create segment' },
      { status: 500 }
    )
  }
}
