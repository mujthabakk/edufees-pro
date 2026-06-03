export const mockStats = {
  totalStudents: 1248,
  totalCollected: 8450000,
  totalPending: 1230000,
  totalOverdue: 340000,
  collectionRate: 87.3,
};

export const mockRecentPayments = [
  { id: "1", studentName: "Aryan Sharma", admissionNo: "ADM-2024-001", class: "Class 10 - A", amount: 15000, mode: "ONLINE", date: "2026-06-01", status: "PAID" },
  { id: "2", studentName: "Priya Nair", admissionNo: "ADM-2024-002", class: "Class 8 - B", amount: 12000, mode: "UPI", date: "2026-06-01", status: "PAID" },
  { id: "3", studentName: "Rahul Verma", admissionNo: "ADM-2024-003", class: "Class 12 - A", amount: 8000, mode: "CASH", date: "2026-05-31", status: "PARTIAL" },
  { id: "4", studentName: "Sneha Patel", admissionNo: "ADM-2024-004", class: "Class 6 - C", amount: 10000, mode: "NEFT", date: "2026-05-30", status: "PAID" },
  { id: "5", studentName: "Kiran Reddy", admissionNo: "ADM-2024-005", class: "Class 9 - A", amount: 15000, mode: "CHEQUE", date: "2026-05-29", status: "PENDING" },
];

export const mockStudents = [
  { id: "1", fullName: "Aryan Sharma", admissionNo: "ADM-2024-001", class: "Class 10", division: "A", parentMobile: "9876543210", parentEmail: "aryan.parent@gmail.com", totalFee: 45000, paidAmount: 45000, status: "PAID", quota: "General" },
  { id: "2", fullName: "Priya Nair", admissionNo: "ADM-2024-002", class: "Class 8", division: "B", parentMobile: "9876543211", parentEmail: "priya.parent@gmail.com", totalFee: 40000, paidAmount: 28000, status: "PARTIAL", quota: "SC/ST" },
  { id: "3", fullName: "Rahul Verma", admissionNo: "ADM-2024-003", class: "Class 12", division: "A", parentMobile: "9876543212", parentEmail: "rahul.parent@gmail.com", totalFee: 55000, paidAmount: 0, status: "OVERDUE", quota: "General" },
  { id: "4", fullName: "Sneha Patel", admissionNo: "ADM-2024-004", class: "Class 6", division: "C", parentMobile: "9876543213", parentEmail: "sneha.parent@gmail.com", totalFee: 35000, paidAmount: 35000, status: "PAID", quota: "Scholarship" },
  { id: "5", fullName: "Kiran Reddy", admissionNo: "ADM-2024-005", class: "Class 9", division: "A", parentMobile: "9876543214", parentEmail: "kiran.parent@gmail.com", totalFee: 42000, paidAmount: 21000, status: "PARTIAL", quota: "Sports" },
  { id: "6", fullName: "Aisha Khan", admissionNo: "ADM-2024-006", class: "Class 11", division: "B", parentMobile: "9876543215", parentEmail: "aisha.parent@gmail.com", totalFee: 50000, paidAmount: 50000, status: "PAID", quota: "General" },
  { id: "7", fullName: "Rohan Gupta", admissionNo: "ADM-2024-007", class: "Class 7", division: "A", parentMobile: "9876543216", parentEmail: "rohan.parent@gmail.com", totalFee: 38000, paidAmount: 0, status: "PENDING", quota: "General" },
  { id: "8", fullName: "Meera Singh", admissionNo: "ADM-2024-008", class: "Class 5", division: "B", parentMobile: "9876543217", parentEmail: "meera.parent@gmail.com", totalFee: 32000, paidAmount: 32000, status: "PAID", quota: "Management" },
];

export const mockFeeTypes = [
  { id: "1", name: "Tuition Fee", description: "Monthly tuition charges", isLateFee: false },
  { id: "2", name: "Transport Fee", description: "School bus charges", isLateFee: false },
  { id: "3", name: "Library Fee", description: "Annual library access", isLateFee: false },
  { id: "4", name: "Sports Fee", description: "Sports and extracurricular", isLateFee: false },
  { id: "5", name: "Lab Fee", description: "Science/computer lab usage", isLateFee: false },
  { id: "6", name: "Late Fee", description: "Penalty for late payment", isLateFee: true },
];

export const mockFeeStructures = [
  { id: "1", class: "Class 10", quota: "General", feeType: "Tuition Fee", amount: 3000, frequency: "MONTHLY", dueDay: 10 },
  { id: "2", class: "Class 10", quota: "General", feeType: "Transport Fee", amount: 1500, frequency: "MONTHLY", dueDay: 10 },
  { id: "3", class: "Class 10", quota: "SC/ST", feeType: "Tuition Fee", amount: 1500, frequency: "MONTHLY", dueDay: 10 },
  { id: "4", class: "Class 12", quota: "General", feeType: "Tuition Fee", amount: 4000, frequency: "MONTHLY", dueDay: 5 },
  { id: "5", class: "Class 12", quota: "General", feeType: "Lab Fee", amount: 500, frequency: "MONTHLY", dueDay: 5 },
  { id: "6", class: "Class 6", quota: "Scholarship", feeType: "Tuition Fee", amount: 0, frequency: "MONTHLY", dueDay: 10 },
];

export const mockMonthlyCollection = [
  { month: "Jan", collected: 620000, pending: 80000 },
  { month: "Feb", collected: 710000, pending: 65000 },
  { month: "Mar", collected: 580000, pending: 120000 },
  { month: "Apr", collected: 890000, pending: 45000 },
  { month: "May", collected: 760000, pending: 95000 },
  { month: "Jun", collected: 845000, pending: 123000 },
];

export const mockClassWiseCollection = [
  { class: "Class 5", total: 320000, collected: 290000, percent: 90 },
  { class: "Class 6", total: 350000, collected: 300000, percent: 85 },
  { class: "Class 7", total: 380000, collected: 310000, percent: 81 },
  { class: "Class 8", total: 400000, collected: 360000, percent: 90 },
  { class: "Class 9", total: 420000, collected: 380000, percent: 90 },
  { class: "Class 10", total: 450000, collected: 390000, percent: 86 },
  { class: "Class 11", total: 500000, collected: 420000, percent: 84 },
  { class: "Class 12", total: 550000, collected: 460000, percent: 83 },
];

export const mockCoupons = [
  { id: "1", code: "SIBLING10", discountType: "PERCENTAGE", discountValue: 10, validFrom: "2026-04-01", validUntil: "2027-03-31", maxUses: 100, totalRedeemed: 34, isActive: true },
  { id: "2", code: "MERIT500", discountType: "FLAT", discountValue: 500, validFrom: "2026-04-01", validUntil: "2026-09-30", maxUses: 50, totalRedeemed: 12, isActive: true },
  { id: "3", code: "STAFF20", discountType: "PERCENTAGE", discountValue: 20, validFrom: "2026-04-01", validUntil: "2027-03-31", maxUses: null, totalRedeemed: 8, isActive: false },
];

export const mockNotifications = [
  { id: "1", studentName: "Rahul Verma", channel: "WHATSAPP", template: "OVERDUE_REMINDER", recipient: "9876543212", status: "DELIVERED", sentAt: "2026-06-01 10:30" },
  { id: "2", studentName: "Kiran Reddy", channel: "EMAIL", template: "PAYMENT_DUE", recipient: "kiran.parent@gmail.com", status: "SENT", sentAt: "2026-06-01 09:00" },
  { id: "3", studentName: "Aryan Sharma", channel: "WHATSAPP", template: "PAYMENT_CONFIRMATION", recipient: "9876543210", status: "READ", sentAt: "2026-06-01 08:15" },
  { id: "4", studentName: "Rohan Gupta", channel: "BOTH", template: "FEE_REMINDER", recipient: "9876543216", status: "FAILED", sentAt: "2026-05-31 14:00" },
];

export const mockInvoices = [
  { id: "1", invoiceNo: "INV-2026-001", studentName: "Aryan Sharma", class: "Class 10 - A", amount: 15000, date: "2026-06-01", sentEmail: true, sentWA: true },
  { id: "2", invoiceNo: "INV-2026-002", studentName: "Priya Nair", class: "Class 8 - B", amount: 12000, date: "2026-06-01", sentEmail: true, sentWA: false },
  { id: "3", invoiceNo: "INV-2026-003", studentName: "Sneha Patel", class: "Class 6 - C", amount: 10000, date: "2026-05-30", sentEmail: false, sentWA: true },
  { id: "4", invoiceNo: "INV-2026-004", studentName: "Aisha Khan", class: "Class 11 - B", amount: 20000, date: "2026-05-29", sentEmail: true, sentWA: true },
];
