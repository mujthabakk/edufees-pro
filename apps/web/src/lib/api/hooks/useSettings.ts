import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

export interface SchoolBankDetail {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string | null;
  accountType: string | null;
  upiId: string | null;
  paymentGateway: string | null;
  gatewayApiKey: string | null;
  gatewaySecret: string | null;
}

export interface SchoolProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  schoolType: string | null;
  affiliationBoard: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  country: string | null;
  primaryEmail: string | null;
  secondaryEmail: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  website: string | null;
  academicYearStart: number;
  currency: string;
  themeColor: string | null;
  isActive: boolean;
  bankDetail: SchoolBankDetail | null;
  subscription: {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    studentLimit: number | null;
  } | null;
}

export interface StaffUser {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export function useSchoolProfile() {
  return useQuery({
    queryKey: ["settings", "profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<SchoolProfile>("/settings/profile");
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.patch("/settings/profile", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "profile"] }),
  });
}

export function useUpsertBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.put("/settings/bank", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "profile"] }),
  });
}

export function useStaffUsers() {
  return useQuery({
    queryKey: ["settings", "users"],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffUser[]>("/settings/users");
      return data;
    },
  });
}

export function useCreateStaffUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/settings/users", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "users"] }),
  });
}

export function useUpdateStaffUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.patch(`/settings/users/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "users"] }),
  });
}
