import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiSignup, apiGetMe, setToken, removeToken, getToken } from "./api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const data = await apiGetMe();
      if (data.user_id) {
        setUser({ id: data.user_id, name: data.nickname, email: data.email });
      } else {
        removeToken();
        setUser(null);
      }
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    // 50분마다 유저 정보 갱신 (토큰 만료 전)
    const interval = setInterval(loadUser, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        setToken(data.token);
        const me = await apiGetMe();
        setUser({ id: me.user_id, name: me.nickname, email: me.email });
        return { success: true };
      }
      return { success: false, message: data.message || "로그인 실패" };
    } catch (err) {
      return { success: false, message: "서버 연결 실패" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiSignup(email, password, name);
      if (data.message === "서버 연결 실패. 잠시 후 다시 시도해주세요.") {
        return { success: false, message: data.message };
      }
      const loginData = await apiLogin(email, password);
      if (loginData.token) {
        setToken(loginData.token);
        const me = await apiGetMe();
        setUser({ id: me.user_id, name: me.nickname, email: me.email });
        return { success: true };
      }
      return { success: false, message: "자동 로그인 실패" };
    } catch (err) {
      return { success: false, message: "서버 연결 실패" };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}