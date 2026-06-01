import { createContext, useContext, useState, useEffect } from "react";
import api from "./api"; // 백엔드 요청을 위해 api 가져오기

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⭐️ 로딩 상태 추가 (인증 체크 중 화면 깜빡임 방지)

  // ⭐️ 실제 백엔드 유저 객체(userData)를 그대로 상태에 주입
  const login = (userData) => {
    setUser(userData);
  };

  const register = (name, email) => {
    setUser({ nickname: name, email });
  };

  const logout = () => {
    localStorage.removeItem('token'); // 로그아웃 시 토큰 청소
    setUser(null);
  };

  // ⭐️ [핵심] 새로고침 시 로컬스토리지의 토큰으로 유저 정보 복구
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 토큰이 있다면 백엔드에 내 정보 달라고 요청
        const response = await api.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("토큰 만료 또는 유저 정보 복구 실패:", error);
        // 토큰이 유효하지 않으면 청소
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, register, logout, loading }}>
      {/* ⭐️ 로딩 중일 때는 하위 컴포넌트를 그리지 않거나 로딩 인디케이터를 띄워주면 자연스럽습니다 */}
      {!loading ? children : <div style={{ background: '#111', height: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>인증 정보 확인 중...</div>}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}