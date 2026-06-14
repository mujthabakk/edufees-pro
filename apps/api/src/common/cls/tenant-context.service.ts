import { ForbiddenException, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserRole } from '@prisma/client';
import { AppClsStore } from './cls.types';

@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService<AppClsStore>) {}

  get userId(): string | undefined {
    return this.cls.get('userId');
  }

  get role(): UserRole | undefined {
    return this.cls.get('role');
  }

  /** Active tenant id, or null for platform-level (SUPER_ADMIN) requests. */
  get schoolId(): string | null {
    return this.cls.get('schoolId') ?? null;
  }

  get isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  /**
   * Returns the active school id, throwing if the request has no tenant context.
   * Use in school-scoped resources where a tenant is mandatory.
   */
  requireSchoolId(): string {
    const schoolId = this.schoolId;
    if (!schoolId) {
      throw new ForbiddenException('No active school context for this request');
    }
    return schoolId;
  }
}
