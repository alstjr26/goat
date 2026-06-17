const BASE_URL = "http://localhost:3000";

// 토큰 관리
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// 공통 헤더
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// ── 인증 ──
export const apiSignup = async (email, password, nickname) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("signup 오류:", err);
    return { message: "서버 연결 실패. 잠시 후 다시 시도해주세요." };
  }
};

export const apiLogin = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("login 오류:", err);
    return { message: "서버 연결 실패. 잠시 후 다시 시도해주세요." };
  }
};

export const apiGetMe = () =>
  fetch(`${BASE_URL}/api/users  /me`, {
    headers: authHeaders(),
  }).then(r => r.json());

// ── 내 시간표 ──
export const apiPostSchedule = (title, start_time, end_time) =>
  fetch(`${BASE_URL}/api/schedules`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, start_time, end_time }),
  }).then(r => r.json());

export const apiGetSchedules = () =>
  fetch(`${BASE_URL}/api/schedules`, {
    headers: authHeaders(),
  }).then(r => r.json());

// ── 약속 방 ──
export const apiCreateGroup = (title, description, deadline) =>
  fetch(`${BASE_URL}/api/groups`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, description, deadline }),
  }).then(r => r.json());

export const apiGetGroup = (id) =>
  fetch(`${BASE_URL}/api/groups/${id}`, {
    headers: authHeaders(),
  }).then(r => r.json());

export const apiJoinGroup = (id, email) =>
  fetch(`${BASE_URL}/api/groups/${id}/join`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  }).then(r => r.json());

export const apiGetGroupMembers = (id) =>
  fetch(`${BASE_URL}/api/groups/${id}/members`, {
    headers: authHeaders(),
  }).then(r => r.json());

export const apiPostAvailability = (id, schedule_id, is_available) =>
  fetch(`${BASE_URL}/api/groups/${id}/availability`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ schedule_id, is_available }),
  }).then(r => r.json());

export const apiGetRecommend = (id) =>
  fetch(`${BASE_URL}/api/groups/${id}/recommend`, {
    headers: authHeaders(),
  }).then(r => r.json());

export const apiConfirmGroup = (id, start_time, end_time) =>
  fetch(`${BASE_URL}/api/groups/${id}/confirm`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ start_time, end_time }),
  }).then(r => r.json());

export const apiGetConfirm = (id) =>
  fetch(`${BASE_URL}/api/groups/${id}/confirm`, {
    headers: authHeaders(),
  }).then(r => r.json());