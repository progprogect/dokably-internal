import { BASE_API } from "@app/constants/endpoints"
import axios from "axios"

export interface apiExpiredTokenError {
  response: {
    status: 401
  }
  message: string
}

const api = axios.create({
  baseURL: BASE_API,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') ?? "") || {};
    if (tokens?.token) {
      config.headers.Authorization = `Bearer ${tokens.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export { api }
