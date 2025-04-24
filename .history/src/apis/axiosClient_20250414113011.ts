import axios from 'axios';
import queryString from 'query-string';
import { appInfo } from '../constants/appInfos';
import { useSelector } from 'react-redux';

const axiosClient = axios.create({
  baseURL: appInfo.BASE_URL,
  paramsSerializer: params => queryString.stringify(params),
});
axiosClient.interceptors.request.use(async (config: any) => {
  const token = useSelector((state: any) => state.authReducer.authData.accesstoken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers = {
    Authorization: '',
    Accept: 'application/json',
    ...config.headers,
  };

  config.data;
  return config;
});

axiosClient.interceptors.response.use(
  res => {
    if (res.data && res.status === 200) {
      return res.data;
    }
    throw new Error('Error');
  },
  error => {
    console.log(`Error api ${JSON.stringify(error)}`);
    throw new Error(error.response);
  },
);

export default axiosClient;
