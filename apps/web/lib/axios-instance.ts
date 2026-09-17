import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "")

export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
});