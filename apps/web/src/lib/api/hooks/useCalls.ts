import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

export interface CallLogDto {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  mobile: string;
  calledAt: string;
  duration: number | null;
  summary: string | null;
  nextAction: string | null;
}

export function useCalls(studentId?: string) {
  return useQuery({
    queryKey: ["calls", studentId ?? "all"],
    queryFn: async () => {
      const { data } = await apiClient.get<CallLogDto[]>("/calls", {
        params: studentId ? { studentId } : {},
      });
      return data;
    },
  });
}

export function useCreateCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post("/calls", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calls"] }),
  });
}

export function useDeleteCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/calls/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calls"] }),
  });
}
