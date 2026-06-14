import { ClsStore } from 'nestjs-cls';
import { UserRole } from '@prisma/client';

/**
 * Request-scoped context stored in AsyncLocalStorage (nestjs-cls).
 * Populated by the JWT strategy / tenant middleware on each authenticated request.
 */
export interface AppClsStore extends ClsStore {
  userId?: string;
  role?: UserRole;
  schoolId?: string | null;
  requestId?: string;
}

export const CLS_KEYS = {
  userId: 'userId',
  role: 'role',
  schoolId: 'schoolId',
  requestId: 'requestId',
} as const;
