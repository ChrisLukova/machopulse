import api from "./axios";

export const websiteService = {
  // GET /api/v1/websites
  getUserWebsites: async () => {
    const res = await api.get("/websites");
    return res.data;
  },

  // POST /api/v1/websites
  createWebsite: async (data) => {
    // data: { name, url, checkIntervalSeconds }
    const res = await api.post("/websites", data);
    return res.data;
  },

  // GET /api/v1/websites/{id}
  getWebsiteById: async (id) => {
    const res = await api.get(`/websites/${id}`);
    return res.data;
  },

  // PUT /api/v1/websites/{id}
  updateWebsite: async (id, data) => {
    // data: { name, url, checkIntervalSeconds }
    const res = await api.put(`/websites/${id}`, data);
    return res.data;
  },

  // GET /api/v1/websites/{id}/logs?limit=20
  getWebsiteLogs: async (id, limit = 20) => {
    const res = await api.get(`/websites/${id}/logs`, { params: { limit } });
    return res.data;
  },

  // GET /api/v1/websites/{id}/stats?period=24h
  getWebsiteStats: async (id, period = "24h") => {
    const res = await api.get(`/websites/${id}/stats`, { params: { period } });
    return res.data;
  },

  // POST /api/v1/websites/{id}/ping
  triggerManualPing: async (id) => {
    const res = await api.post(`/websites/${id}/ping`);
    return res.data;
  },

  // DELETE /api/v1/websites/{id}
  deleteWebsite: async (id) => {
    await api.delete(`/websites/${id}`);
  },
};
