import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ================================
// AXIOS INSTANCE
// ================================
const API = axios.create({
  baseURL: BASE_URL, // backend base url
  withCredentials:true,
});

// ================================
// REQUEST INTERCEPTOR (JWT TOKEN)
// ================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// SERVICE APIs
// ================================

// 🔹 Create new service
export const createService = (serviceData) => {
  return API.post("/services", serviceData);
};

// 🔹 Get all services
export const getAllServices = () => {
  return API.get("/services");
};

// 🔹 Get services by logged-in user
export const getMyServices = () => {
  return API.get("/services/my");
};

// 🔹 Update service (only creator allowed)
export const updateService = (serviceId, updatedData) => {
  return API.put(`/services/${serviceId}`, updatedData);
};

// 🔹 Delete service (only creator allowed)
export const deleteService = (serviceId) => {
  return API.delete(`/services/${serviceId}`);
};

// 🔹 Toggle Active / Inactive (optional)
export const toggleServiceStatus = (serviceId, isActive) => {
  return API.put(`/services/${serviceId}/status`, { isActive });
};

export default API;
