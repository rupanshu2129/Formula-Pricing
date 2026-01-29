import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, segmentId } = body

    if (!customerId || !segmentId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and Segment ID are required' },
        { status: 400 }
      )
    }

    const existingAssignment = await prisma.customerAssignment.findFirst({
      where: {
        customerId,
        segmentId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Customer is already assigned to this segment' },
        { status: 400 }
      )
    }

    const assignment = await prisma.customerAssignment.create({
      data: {
        customerId,
        segmentId,
        assignedBy: 'system-user'
      },
      include: {
        customer: true,
        segment: true
      }
    })

    return NextResponse.json({ success: true, assignment })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const segmentId = searchParams.get('segmentId')

    if (!customerId || !segmentId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and Segment ID are required' },
        { status: 400 }
      )
    }

    await prisma.customerAssignment.deleteMany({
      where: {
        customerId,
        segmentId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
