import axios from 'axios';

// 기본 API 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:3000', // 백엔드 로컬 주소
});

// 요청(Request) 인터셉터: API를 보낼 때마다 자동으로 토큰을 헤더에 넣어줍니다.
api.interceptors.request.use(
  (config) => {
    // localStorage 등에서 토큰을 가져옵니다 (로그인 시 저장해둔 토큰)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;