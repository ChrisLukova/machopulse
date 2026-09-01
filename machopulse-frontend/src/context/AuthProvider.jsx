// src/context/AuthProvider.jsx
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() =>
    localStorage.getItem("machopulse_token"),
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!token,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("machopulse_token");
        setToken(null);
        queryClient.clear();
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 15,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("machopulse_token");
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const handleAuthSuccess = useCallback(
    (data) => {
      if (data?.token) {
        localStorage.setItem("machopulse_token", data.token);
        setToken(data.token);
      }
      queryClient.setQueryData(["authUser"], data?.user || data);
    },
    [queryClient],
  );

  const loginMutation = useMutation({
    mutationFn: ({ usernameOrEmail, password }) =>
      authService.login(usernameOrEmail, password),
    onSuccess: handleAuthSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password }) =>
      authService.register(username, email, password),
    onSuccess: handleAuthSuccess,
  });

  // Extract stable function references for login & register
  const { mutateAsync: loginMutate } = loginMutation;
  const { mutateAsync: registerMutate } = registerMutation;

  const login = useCallback(
    (usernameOrEmail, password) => loginMutate({ usernameOrEmail, password }),
    [loginMutate],
  );

  const register = useCallback(
    (username, email, password) =>
      registerMutate({ username, email, password }),
    [registerMutate],
  );

  const value = useMemo(
    () => ({
      token,
      user: user || null,
      isAuthenticated: !!token && !!user,
      isLoading: isLoading && !!token,
      loginMutation,
      registerMutation,
      login,
      register,
      logout,
    }),
    [
      token,
      user,
      isLoading,
      loginMutation,
      registerMutation,
      login,
      register,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
