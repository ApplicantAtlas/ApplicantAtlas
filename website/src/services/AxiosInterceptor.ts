import axios from "axios";
import { eventEmitter } from "../events/EventEmitter";
import { API_URL } from "../config/constants";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const tok = localStorage.getItem("token");
    if (user && user.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    } else if (tok) {
      config.headers["Authorization"] = `Bearer ${tok}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      eventEmitter.emit(
        "apiError",
        "Could not connect to server. Please try again later."
      );
    }

    if (
      error.response &&
      error.response.data &&
      error.response.data.error == "Invalid or expired token" &&
      error.response.status == 401
    ) {
      eventEmitter.emit(
        "apiError",
        "You have been logged out. Please log in again."
      );
      window.location.href = "/logout"; // Redirect to logout if not already on login page
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.error
    ) {
      // Emit a custom event with the error message
      eventEmitter.emit("apiError", error.response.data.error);
    }

    return Promise.reject(error);
  }
);

export default api;
