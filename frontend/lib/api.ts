import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: backendUrl,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  res => res,
  err => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);
