// Shared enums and API contract types consumed by both @edufees/web and @edufees/api.
// Enum string values mirror the Prisma schema exactly so the wire format is stable.

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  TEACHER = "TEACHER",
  PARENT = "PARENT",
}

export enum SchoolType {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  COLLEGE = "COLLEGE",
  OTHER = "OTHER",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
  TRIAL = "TRIAL",
}

export enum FeeFrequency {
  ONE_TIME = "ONE_TIME",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  HALF_YEARLY = "HALF_YEARLY",
  ANNUAL = "ANNUAL",
}

export enum DiscountType {
  FLAT = "FLAT",
  PERCENTAGE = "PERCENTAGE",
}

export enum PaymentMode {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  NEFT = "NEFT",
  BANK_TRANSFER = "BANK_TRANSFER",
  ONLINE = "ONLINE",
  UPI = "UPI",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export enum NotificationChannel {
  WHATSAPP = "WHATSAPP",
  EMAIL = "EMAIL",
  BOTH = "BOTH",
}

export enum NotificationStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}

export enum PaymentGateway {
  RAZORPAY = "RAZORPAY",
  PAYU = "PAYU",
  STRIPE = "STRIPE",
  MANUAL = "MANUAL",
}

// ---------------------------------------------------------------------------
// Common API envelope types
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  schoolId: string | null;
  mustChangePassword: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export interface StudentSummary {
  id: string;
  fullName: string;
  admissionNo: string;
  className: string | null;
  divisionName: string | null;
  quotaName: string | null;
  parentMobile: string;
  parentEmail: string | null;
  totalFee: number;
  paidAmount: number;
  status: PaymentStatus;
}

export interface StudentDetail extends StudentSummary {
  schoolId: string;
  academicYearId: string;
  classId: string;
  divisionId: string | null;
  batchId: string | null;
  quotaId: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  photoUrl: string | null;
  rollNo: string | null;
  whatsappNumber: string | null;
  alternatePhone: string | null;
  fatherName: string | null;
  motherName: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Fees & payments
// ---------------------------------------------------------------------------

export interface FeeTypeDto {
  id: string;
  name: string;
  description: string | null;
  isCustom: boolean;
  isLateFee: boolean;
}

export interface FeeStructureDto {
  id: string;
  academicYearId: string;
  classId: string;
  quotaId: string | null;
  feeTypeId: string;
  feeTypeName: string;
  className: string;
  amount: number;
  frequency: FeeFrequency;
  dueDay: number | null;
  isOptional: boolean;
  isRefundable: boolean;
}

export interface StudentFeeAssignmentDto {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  feeTypeName: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  concessionNote: string | null;
  dueDate: string;
  status: PaymentStatus;
}

export interface PaymentDto {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  assignmentId: string | null;
  amount: number;
  paymentMode: PaymentMode;
  referenceNo: string | null;
  notes: string | null;
  paymentDate: string;
  isOnline: boolean;
  invoiceId: string | null;
  invoiceNo: string | null;
}
