import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FeeStructureDto,
  FeeTypeDto,
  StudentFeeAssignmentDto,
} from "@edufees/shared-types";
import { apiClient } from "../client";

const feeKeys = {
  types: ["fees", "types"] as const,
  structures: (params: Record<string, unknown>) =>
    ["fees", "structures", params] as const,
  assignments: (studentId?: string) =>
    ["fees", "assignments", studentId ?? "all"] as const,
};

export function useFeeTypes() {
  return useQuery({
    queryKey: feeKeys.types,
    queryFn: async () => {
      const { data } = await apiClient.get<FeeTypeDto[]>("/fees/types");
      return data;
    },
  });
}

export function useFeeStructures(params: { classId?: string } = {}) {
  return useQuery({
    queryKey: feeKeys.structures(params),
    queryFn: async () => {
      const { data } = await apiClient.get<FeeStructureDto[]>(
        "/fees/structures",
        { params },
      );
      return data;
    },
  });
}

export function useCreateFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/fees/structures", payload);
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["fees", "structures"] }),
  });
}

export function useCreateFeeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/fees/types", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: feeKeys.types }),
  });
}

export function useFeeAssignments(studentId?: string) {
  return useQuery({
    queryKey: feeKeys.assignments(studentId),
    queryFn: async () => {
      const { data } = await apiClient.get<StudentFeeAssignmentDto[]>(
        "/fees/assignments",
        { params: studentId ? { studentId } : {} },
      );
      return data;
    },
  });
}

export function useAssignFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post<StudentFeeAssignmentDto>(
        "/fees/assignments",
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees", "assignments"] }),
  });
}

export function useUpdateFeeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.patch(`/fees/types/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: feeKeys.types }),
  });
}

export function useDeleteFeeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/fees/types/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: feeKeys.types }),
  });
}

export function useUpdateFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.patch(`/fees/structures/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees", "structures"] }),
  });
}

export function useDeleteFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/fees/structures/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees", "structures"] }),
  });
}
