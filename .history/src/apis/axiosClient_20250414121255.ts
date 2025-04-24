import axios from 'axios';
import queryString from 'query-string';
import { appInfo } from '../constants/appInfos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: appInfo.BASE_URL,
  paramsSerializer: params => queryString.stringify(params),
});
axiosClient.interceptors.request.use(async (config: any) => {
  const tokenString = await AsyncStorage.getItem('auth'); // Lấy chuỗi JSON từ AsyncStorage
  const token = tokenString ? JSON.parse(tokenString) : null; // Phân tích chuỗi JSON thành đối tượng

  if (token && token.accesstoken) {
    config.headers.Authorization = `Bearer ${token.accesstoken}`; // Thêm token vào header
  }

  config.headers.Accept = 'application/json'; // Đảm bảo header Accept luôn được thiết lập
  return config;
});
axiosClient.interceptors.response.use(
  response => {
    // Nếu phản hồi có `success: true`, trả về dữ liệu
    if (response?.data?.success) {
      return response.data;
    }

    // Nếu `success: false`, ném lỗi để xử lý trong `catch`
    return Promise.reject(response.data);
  },
  error => {
    // Xử lý lỗi từ backend
    if (error.response) {
      console.error('Error from API:', error.response.data); // Log chi tiết lỗi từ backend
      return Promise.reject(error.response.data); // Trả về dữ liệu lỗi từ backend
    } else {
      console.error('Unexpected Error:', error.message); // Log lỗi không xác định
      return Promise.reject({ message: 'Unexpected error occurred', error: error.message });
    }
  }
);

export default axiosClient;
