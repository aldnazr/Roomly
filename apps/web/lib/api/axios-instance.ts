import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});
