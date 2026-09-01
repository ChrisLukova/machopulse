import api from "./axios";

export const authService = {
  login: async (usernameOrEmail, password) => {
    const res = await api.post("/auth/login", { usernameOrEmail, password });
    return res.data;
  },

  register: async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
