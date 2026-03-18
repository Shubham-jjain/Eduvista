import axios from "axios";

// Pre-configured Axios instance with base URL and credentials
const API = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
});

export default API;
