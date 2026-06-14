import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

export interface ClassWithDivisions {
  id: string;
  name: string;
  sortOrder: number;
  divisions: { id: string; name: string }[];
}

export interface AcademicYearDto {
  id: string;
  label: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface QuotaDto {
  id: string;
  name: string;
  description: string | null;
}

export function useClasses() {
  return useQuery({
    queryKey: ["academic", "classes"],
    queryFn: async () => {
      const { data } = await apiClient.get<ClassWithDivisions[]>(
        "/academic/classes",
      );
      return data;
    },
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic", "years"],
    queryFn: async () => {
      const { data } = await apiClient.get<AcademicYearDto[]>("/academic/years");
      return data;
    },
  });
}

export function useQuotas() {
  return useQuery({
    queryKey: ["academic", "quotas"],
    queryFn: async () => {
      const { data } = await apiClient.get<QuotaDto[]>("/academic/quotas");
      return data;
    },
  });
}

function useAcademicMutation(path: string, invalidate: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post(path, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic", invalidate] }),
  });
}

export const useCreateAcademicYear = () =>
  useAcademicMutation("/academic/years", "years");
export const useCreateClass = () =>
  useAcademicMutation("/academic/classes", "classes");
export const useCreateDivision = () =>
  useAcademicMutation("/academic/divisions", "classes");
export const useCreateQuota = () =>
  useAcademicMutation("/academic/quotas", "quotas");

export function useSetCurrentYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/academic/years/${id}/current`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic", "years"] }),
  });
}

function useAcademicPatch(path: string, invalidate: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.patch(`${path}/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic", invalidate] }),
  });
}

function useAcademicDelete(path: string, invalidate: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`${path}/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic", invalidate] }),
  });
}

export const useUpdateAcademicYear = () =>
  useAcademicPatch("/academic/years", "years");
export const useDeleteAcademicYear = () =>
  useAcademicDelete("/academic/years", "years");
export const useUpdateClass = () =>
  useAcademicPatch("/academic/classes", "classes");
export const useDeleteClass = () =>
  useAcademicDelete("/academic/classes", "classes");
export const useUpdateDivision = () =>
  useAcademicPatch("/academic/divisions", "classes");
export const useDeleteDivision = () =>
  useAcademicDelete("/academic/divisions", "classes");
export const useUpdateQuota = () =>
  useAcademicPatch("/academic/quotas", "quotas");
export const useDeleteQuota = () =>
  useAcademicDelete("/academic/quotas", "quotas");
