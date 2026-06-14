import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Paginated, PaymentDto, PaymentMode } from "@edufees/shared-types";
import { apiClient } from "../client";

export interface PaymentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  studentId?: string;
  paymentMode?: PaymentMode;
}

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: ["payments", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<PaymentDto>>("/payments", {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post<PaymentDto>("/payments", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["fees", "assignments"] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/payments/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["fees", "assignments"] });
    },
  });
}

export function useInvoiceUrl() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await apiClient.get<{ url: string }>(
        `/payments/invoices/${invoiceId}/url`,
      );
      return data.url;
    },
  });
}
