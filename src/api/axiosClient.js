import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Trước khi gửi Request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Sau khi nhận Response
axiosClient.interceptors.response.use(
    (response) => {
        // Backend của ta bọc dữ liệu trong field "result" của ApiResponse
        if (response.data && response.data.result !== undefined) {
            return response.data.result; 
        }
        return response.data;
    },
    (error) => {
        // Xử lý lỗi 401 (Hết hạn Token) hoặc 403 (Không có quyền)
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login'; // Bắt đăng nhập lại
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default axiosClient;