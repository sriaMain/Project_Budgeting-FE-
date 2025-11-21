import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.0.234:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },

});


export default axiosInstance;