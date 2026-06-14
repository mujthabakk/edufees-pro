import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Paginated,
  PaymentStatus,
  StudentDetail,
  StudentSummary,
} from "@edufees/shared-types";
import { apiClient } from "../client";

export interface StudentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  classId?: string;
  divisionId?: string;
  status?: PaymentStatus;
}

const studentKeys = {
  all: ["students"] as const,
  list: (params: StudentListParams) => ["students", "list", params] as const,
  detail: (id: string) => ["students", "detail", id] as const,
};

export function useStudents(params: StudentListParams = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<StudentSummary>>(
        "/students",
        { params },
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<StudentDetail>(`/students/${id}`);
      return data;
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post<StudentDetail>(
        "/students",
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const { data } = await apiClient.patch<StudentDetail>(
        `/students/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/students/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useBulkImportStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      rows: Record<string, unknown>[];
      academicYearId?: string;
    }) => {
      const { data } = await apiClient.post<{
        jobId: string;
        queued: number;
      }>("/students/import", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useImportStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["students", "import", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        jobId: string;
        state: string;
        progress: number;
        result: unknown;
        failedReason: string | null;
      }>(`/students/import/${jobId}`);
      return data;
    },
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "completed" || state === "failed" ? false : 2000;
    },
  });
}
