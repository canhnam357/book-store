import axios from 'axios';
import { store } from '../store';
import { logoutUser } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL_BASE,
});

// Biến cờ để kiểm tra xem quá trình làm mới token có đang diễn ra không
let isRefreshing = false;
// Mảng lưu trữ các yêu cầu bị lỗi 401 trong khi token đang được làm mới
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Unauthorized)
    if (
      (error.response?.status === 401 || error.response?.data?.statusCode === 401) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        axios
          .post(process.env.REACT_APP_API_URL_BASE + '/auth/refresh-access-token', {}, { withCredentials: true })
          .then(({ data }) => {
            const { accessToken } = data.result;
            localStorage.setItem('accessToken', accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem('accessToken');
            store.dispatch(logoutUser());
            toast.dismiss();
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Xử lý lỗi 403 (Forbidden)
    if (error.response?.status === 403 || error.response?.data?.statusCode === 403) {
      localStorage.removeItem('accessToken');
      store.dispatch(logoutUser());
      toast.dismiss();
      toast.error('Quyền truy cập bị từ chối. Vui lòng đăng nhập lại!');
      window.location.href = '/login';
      return Promise.reject(new Error('Quyền truy cập bị từ chối'));
    }

    return Promise.reject(error);
  }
);

export default api;
