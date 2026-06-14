import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse } from "@edufees/shared-types";
import { apiClient } from "../client";
import { useAppDispatch } from "@/store/hooks";
import { logout as logoutAction, setCredentials } from "@/store/auth-slice";

export function useLogin() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await apiClient.post<LoginResponse>(
        "/auth/login",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data));
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  return () => {
    void apiClient.post("/auth/logout").catch(() => undefined);
    dispatch(logoutAction());
  };
}
