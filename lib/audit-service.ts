import { prisma } from './prisma'

export class AuditService {
  static async log(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes,
        ipAddress,
        userAgent,
      },
    })
  }
  
  static async getEntityHistory(entityType: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
