import 'dotenv/config';
import {
  AccountType,
  FeeFrequency,
  Gender,
  PaymentMode,
  PaymentStatus,
  PrismaClient,
  SchoolType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('Seeding EduFees Pro...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ---- Super admin (platform-level, no school) ----
  await prisma.user.upsert({
    where: { email: 'superadmin@edufees.pro' },
    update: {},
    create: {
      role: UserRole.SUPER_ADMIN,
      email: 'superadmin@edufees.pro',
      username: 'superadmin',
      passwordHash: await hash('Super@123'),
    },
  });

  // ---- School (tenant) ----
  const school = await prisma.school.upsert({
    where: { slug: 'greenfield' },
    update: {},
    create: {
      name: 'Greenfield International School',
      slug: 'greenfield',
      schoolType: SchoolType.SECONDARY,
      addressLine1: '12 Park Avenue',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      primaryEmail: 'info@greenfield.edu',
      primaryPhone: '08012345678',
      academicYearStart: 6,
      currency: 'INR',
      bankDetail: {
        create: {
          accountHolderName: 'Greenfield International School',
          bankName: 'State Bank',
          accountNumber: '000111222333',
          ifscCode: 'SBIN0001234',
          accountType: AccountType.CURRENT,
        },
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.GROWTH,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
          studentLimit: 2000,
        },
      },
    },
  });

  // ---- Staff users ----
  await prisma.user.upsert({
    where: { email: 'admin@greenfield.edu' },
    update: {},
    create: {
      schoolId: school.id,
      role: UserRole.SCHOOL_ADMIN,
      email: 'admin@greenfield.edu',
      username: 'greenfield-admin',
      passwordHash: await hash('Admin@123'),
    },
  });
  await prisma.user.upsert({
    where: { email: 'accounts@greenfield.edu' },
    update: {},
    create: {
      schoolId: school.id,
      role: UserRole.ACCOUNTANT,
      email: 'accounts@greenfield.edu',
      username: 'greenfield-accounts',
      passwordHash: await hash('Accounts@123'),
    },
  });
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@greenfield.edu' },
    update: {},
    create: {
      schoolId: school.id,
      role: UserRole.TEACHER,
      email: 'teacher@greenfield.edu',
      username: 'greenfield-teacher',
      passwordHash: await hash('Teacher@123'),
    },
  });

  // ---- Academic year ----
  const year = await prisma.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.id, label: '2025-26' } },
    update: { isCurrent: true },
    create: {
      schoolId: school.id,
      label: '2025-26',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-05-31'),
      isCurrent: true,
    },
  });

  // ---- Classes + divisions ----
  const classNames = ['Class 8', 'Class 9', 'Class 10'];
  const classes = [];
  for (let i = 0; i < classNames.length; i++) {
    const klass = await prisma.class.upsert({
      where: { schoolId_name: { schoolId: school.id, name: classNames[i] } },
      update: {},
      create: { schoolId: school.id, name: classNames[i], sortOrder: i },
    });
    classes.push(klass);
    for (const div of ['A', 'B']) {
      await prisma.division.upsert({
        where: { classId_name: { classId: klass.id, name: div } },
        update: {},
        create: { schoolId: school.id, classId: klass.id, name: div },
      });
    }
  }

  // Assign teacher to Class 10 - A
  const class10 = classes.find((c) => c.name === 'Class 10')!;
  const class10A = await prisma.division.findFirstOrThrow({
    where: { classId: class10.id, name: 'A' },
  });
  await prisma.teacherClassAssignment.upsert({
    where: {
      userId_divisionId: { userId: teacher.id, divisionId: class10A.id },
    },
    update: {},
    create: { userId: teacher.id, divisionId: class10A.id },
  });

  // ---- Quotas ----
  const general = await prisma.quota.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'General' } },
    update: {},
    create: { schoolId: school.id, name: 'General' },
  });
  await prisma.quota.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Management' } },
    update: {},
    create: { schoolId: school.id, name: 'Management' },
  });

  // ---- Fee types + structures ----
  const tuition = await prisma.feeType.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Tuition Fee' } },
    update: {},
    create: { schoolId: school.id, name: 'Tuition Fee' },
  });
  const transport = await prisma.feeType.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Transport Fee' } },
    update: {},
    create: { schoolId: school.id, name: 'Transport Fee' },
  });

  for (const klass of classes) {
    await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        academicYearId: year.id,
        classId: klass.id,
        quotaId: general.id,
        feeTypeId: tuition.id,
        amount: 45000,
        frequency: FeeFrequency.ANNUAL,
        dueDay: 10,
      },
    });
    await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        academicYearId: year.id,
        classId: klass.id,
        feeTypeId: transport.id,
        amount: 12000,
        frequency: FeeFrequency.ANNUAL,
        dueDay: 10,
      },
    });
  }

  // ---- Sample students with linked accounts, fees, and a payment ----
  const adminUser = await prisma.user.findFirstOrThrow({
    where: { email: 'admin@greenfield.edu' },
  });

  const sampleStudents = [
    { fullName: 'Aryan Sharma', admissionNo: 'ADM-2025-001', gender: Gender.MALE },
    { fullName: 'Diya Nair', admissionNo: 'ADM-2025-002', gender: Gender.FEMALE },
    { fullName: 'Kabir Mehta', admissionNo: 'ADM-2025-003', gender: Gender.MALE },
    { fullName: 'Ananya Rao', admissionNo: 'ADM-2025-004', gender: Gender.FEMALE },
  ];

  const tuitionStructure = await prisma.feeStructure.findFirstOrThrow({
    where: { schoolId: school.id, classId: class10.id, feeTypeId: tuition.id },
  });

  for (let i = 0; i < sampleStudents.length; i++) {
    const s = sampleStudents[i];
    const existing = await prisma.student.findFirst({
      where: { schoolId: school.id, admissionNo: s.admissionNo },
    });
    if (existing) continue;

    const parentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        role: UserRole.PARENT,
        email: `${s.admissionNo.toLowerCase()}@students.greenfield.edu`,
        username: `greenfield-${s.admissionNo}`,
        passwordHash: await hash('Student@123'),
        mustChangePassword: true,
      },
    });

    const student = await prisma.student.create({
      data: {
        schoolId: school.id,
        userId: parentUser.id,
        academicYearId: year.id,
        classId: class10.id,
        divisionId: class10A.id,
        quotaId: general.id,
        fullName: s.fullName,
        admissionNo: s.admissionNo,
        gender: s.gender,
        parentMobile: `98765432${10 + i}`,
        parentEmail: `parent.${s.admissionNo.toLowerCase()}@example.com`,
        fatherName: 'Parent Name',
      },
    });

    const assignment = await prisma.studentFeeAssignment.create({
      data: {
        studentId: student.id,
        feeStructureId: tuitionStructure.id,
        grossAmount: 45000,
        discountAmount: i === 1 ? 5000 : 0,
        netAmount: i === 1 ? 40000 : 45000,
        paidAmount: 0,
        dueDate: new Date('2025-07-10'),
        status: PaymentStatus.PENDING,
      },
    });

    // First student has fully paid, second partially paid.
    if (i === 0 || i === 1) {
      const amount = i === 0 ? 45000 : 20000;
      const payment = await prisma.payment.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          assignmentId: assignment.id,
          recordedById: adminUser.id,
          amount,
          paymentMode: PaymentMode.UPI,
          referenceNo: `UPI${1000 + i}`,
          paymentDate: new Date(),
        },
      });
      await prisma.studentFeeAssignment.update({
        where: { id: assignment.id },
        data: {
          paidAmount: amount,
          status: i === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
        },
      });
      await prisma.invoice.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          paymentId: payment.id,
          invoiceNo: `INV-SEED-${1000 + i}`,
        },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
