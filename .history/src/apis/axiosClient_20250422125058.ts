import axios from 'axios';
import queryString from 'query-string';
import { appInfo } from '../constants/appInfos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: appInfo.BASE_URL,
  paramsSerializer: params => queryString.stringify(params),
});

axiosClient.interceptors.request.use(async (config: any) => {
  try {
    const tokenString = await AsyncStorage.getItem('auth');
    console.log('Auth token string from AsyncStorage:', tokenString); // Log chuỗi lấy được
    const token = tokenString ? JSON.parse(tokenString) : null;

    if (token && token.accesstoken) {
      config.headers.Authorization = `Bearer ${token.accesstoken}`;
      console.log('Authorization header set'); // Xác nhận header được set
    } else {
      console.log('No valid access token found in AsyncStorage');
    }

    config.headers.Accept = 'application/json';
    return config;
  } catch (interceptorError) {
    console.error('Error inside request interceptor:', interceptorError);
    // Ném lại lỗi để catch bên ngoài bắt được hoặc xử lý tại đây
    throw interceptorError;
  }
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
