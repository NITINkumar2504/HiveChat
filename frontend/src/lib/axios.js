import axios from 'axios'

export const axiosInstance = axios.create({ 
    // the base URL is used for REST API requests made with Axios
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
    withCredentials: true   // includes cookies and headers with request
})