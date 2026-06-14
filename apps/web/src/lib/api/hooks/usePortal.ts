import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

export interface PortalStudent {
  id: string;
  fullName: string;
  admissionNo: string;
  className: string | null;
  divisionName: string | null;
  totalFee: number;
  paidAmount: number;
  balance: number;
}

export interface PortalFee {
  id: string;
  feeTypeName: string;
  netAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

export interface PortalInvoice {
  id: string;
  invoiceNo: string;
  amount: number;
  date: string;
  hasPdf: boolean;
}

export function useMyStudent() {
  return useQuery({
    queryKey: ["portal", "me", "student"],
    queryFn: async () => {
      const { data } = await apiClient.get<PortalStudent>("/portal/me/student");
      return data;
    },
  });
}

export function useMyFees() {
  return useQuery({
    queryKey: ["portal", "me", "fees"],
    queryFn: async () => {
      const { data } = await apiClient.get<PortalFee[]>("/portal/me/fees");
      return data;
    },
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ["portal", "me", "invoices"],
    queryFn: async () => {
      const { data } = await apiClient.get<PortalInvoice[]>("/portal/me/invoices");
      return data;
    },
  });
}

export function useTeacherStudents() {
  return useQuery({
    queryKey: ["portal", "teacher", "students"],
    queryFn: async () => {
      const { data } = await apiClient.get<PortalStudent[]>(
        "/portal/teacher/students",
      );
      return data;
    },
  });
}

export interface InitiatePaymentResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  mockPaymentId: string;
  signature: string;
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (payload: { assignmentId: string; amount: number }) => {
      const { data } = await apiClient.post<InitiatePaymentResult>(
        "/portal/me/payments/initiate",
        payload,
      );
      return data;
    },
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      assignmentId: string;
      amount: number;
      gatewayOrderId: string;
      gatewayPaymentId: string;
      signature: string;
    }) => {
      const { data } = await apiClient.post("/portal/me/payments/verify", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal"] });
    },
  });
}
