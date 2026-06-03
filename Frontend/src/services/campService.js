import api from "./api";

const campService = {
  getCamps: async () => {
    const res = await api.get("/camps");
    return res.data;
  },
  getCampsWithCount: async () => {
    const res = await api.get("/camps/with-count");
    return res.data;
  },
  createCamp: async (data) => {
    const res = await api.post("/camps", data);
    return res.data;
  },
  updateCamp: async (id, data) => {
    const res = await api.put(`/camps/${id}`, data);
    return res.data;
  },
  deleteCamp: async (id) => {
    const res = await api.delete(`/camps/${id}`);
    return res.data;
  },
};

export default campService;
