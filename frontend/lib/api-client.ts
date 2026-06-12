import axios from "axios";

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data);
      
      // 特定状态码处理
      if (status === 401) {
        // 未授权，跳转登录
        console.error("未授权，请登录");
      } else if (status === 500) {
        console.error("服务器错误");
      }
    } else if (error.request) {
      console.error("网络错误，请检查连接");
    } else {
      console.error("请求配置错误:", error.message);
    }
    return Promise.reject(error);
  }
);