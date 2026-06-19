import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiSignup, apiGetMe, setToken, removeToken, getToken } from "./api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 토큰 있으면 자동 로그인
  useEffect(() => {
    const token = getToken();
    if (token) {
      apiGetMe()
        .then(data => {
          if (data.user_id) {
            setUser({ id: data.user_id, name: data.nickname, email: data.email });
          } else {
            removeToken();
          }
        })
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        setToken(data.token);
        setUser({ name: data.nickname, email });
        return { success: true, name: data.nickname };
      }
      return { success: false, message: data.message || "로그인 실패" };
    } catch (err) {
      return { success: false, message: "서버 연결 실패" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiSignup(email, password, name);
      console.log("signup 응답:", data);
      if (data.message === "서버 연결 실패. 잠시 후 다시 시도해주세요.") {
        return { success: false, message: data.message };
      }
      // 회원가입 성공 후 자동 로그인
      const loginData = await apiLogin(email, password);
      if (loginData.token) {
        setToken(loginData.token);
        setUser({ name, email });
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