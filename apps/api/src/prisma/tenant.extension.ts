import { Prisma } from '@prisma/client';

/**
 * Models that carry a `schoolId` column directly and are therefore tenant-scoped.
 * Anything not in this set is either the tenant root (`School`) or scoped
 * transitively through a relation and must be guarded in the service layer.
 */
export const TENANT_MODELS = new Set<string>([
  'User',
  'SchoolBankDetail',
  'SchoolSubscription',
  'AcademicYear',
  'Class',
  'Division',
  'Batch',
  'Quota',
  'FeeType',
  'FeeStructure',
  'Student',
  'Payment',
  'Invoice',
  'CouponCode',
  'NotificationLog',
  'AuditLog',
]);

// Operations whose `where` we transparently constrain to the active school.
const WHERE_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
]);

// Operations whose `data` we stamp with the active school on insert.
const CREATE_OPS = new Set(['create', 'createMany']);

/**
 * Builds a Prisma client extension that auto-scopes tenant models to `schoolId`.
 *
 * Notes:
 * - `findUnique`/`update`/`delete`/`upsert` are intentionally NOT rewritten
 *   (their `where` must reference a unique constraint). Services performing
 *   single-record lookups by id must include `schoolId` themselves, typically
 *   via `findFirst({ where: { id, schoolId } })`.
 * - SUPER_ADMIN requests resolve to a `null` schoolId and therefore use the
 *   base (unscoped) client; this extension is never applied for them.
 */
export function tenantExtension(schoolId: string) {
  return Prisma.defineExtension({
    name: 'tenant-scope',
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ model, operation, args, query }: any) {
          if (!TENANT_MODELS.has(model)) {
            return query(args);
          }

          if (WHERE_OPS.has(operation)) {
            args = {
              ...args,
              where: { ...(args?.where ?? {}), schoolId },
            };
          } else if (CREATE_OPS.has(operation)) {
            if (operation === 'createMany') {
              const rows = Array.isArray(args?.data) ? args.data : [args?.data];
              args = {
                ...args,
                data: rows.map((row: Record<string, unknown>) => ({
                  schoolId,
                  ...row,
                })),
              };
            } else {
              args = {
                ...args,
                data: { schoolId, ...(args?.data ?? {}) },
              };
            }
          }

          return query(args);
        },
      },
    },
  });
}

export type TenantClientExtension = ReturnType<typeof tenantExtension>;
