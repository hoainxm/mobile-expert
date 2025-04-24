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
  res => {
    if (res.data && res.status === 200 || res.status === 201) {
      return res.data ; 
    }
    throw new Error('Error');
  },
  error => {
    console.log(`Error api ${JSON.stringify(error)}`);
    throw new Error(error.response);
  },
);

export default axiosClient;
