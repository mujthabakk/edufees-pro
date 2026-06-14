export const QUEUE_BULK_IMPORT = 'bulk-import';
export const QUEUE_REMINDERS = 'reminders';
export const QUEUE_NOTIFICATIONS = 'notifications';

export const ALL_QUEUES = [
  QUEUE_BULK_IMPORT,
  QUEUE_REMINDERS,
  QUEUE_NOTIFICATIONS,
] as const;

export interface BulkImportJobData {
  schoolId: string;
  academicYearId: string;
  uploadedById: string;
  rows: Record<string, unknown>[];
}

export interface ReminderJobData {
  schoolId: string;
  studentIds: string[];
  channel: 'WHATSAPP' | 'EMAIL' | 'BOTH';
  template: string;
}

export interface NotificationJobData {
  schoolId: string;
  studentIds: string[];
  channel: 'WHATSAPP' | 'EMAIL' | 'BOTH';
  template: string;
  message: string;
}
