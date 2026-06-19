const BASE_URL = 'https://schedule-project-d3es.onrender.com'

// 토큰 관리
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// 공통 fetch 함수 (401 시 자동 로그아웃)
const authFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    removeToken();
    window.location.href = "/";
  }
  return res;
};

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
  authFetch(`${BASE_URL}/api/users/me`).then(r => r.json());

// ── 내 시간표 ──
export const apiPostSchedule = (title, start_time, end_time) =>
  authFetch(`${BASE_URL}/api/schedules`, {
    method: "POST",
    body: JSON.stringify({ title, start_time, end_time }),
  }).then(r => r.json());

export const apiGetSchedules = () =>
  authFetch(`${BASE_URL}/api/schedules`).then(r => r.json());

export const apiDeleteSchedule = (id) =>
  authFetch(`${BASE_URL}/api/schedules/${id}`, {
    method: "DELETE",
  }).then(r => {
    if (!r.ok) throw new Error("삭제 실패");
    return r.json();
  });

// ── 약속 방 ──
export const apiCreateGroup = (title, description, deadline) =>
  authFetch(`${BASE_URL}/api/groups`, {
    method: "POST",
    body: JSON.stringify({ title, description, deadline }),
  }).then(r => r.json());

export const apiGetGroup = (id) =>
  authFetch(`${BASE_URL}/api/groups/${id}`).then(r => r.json());

export const apiJoinGroup = (id, email) =>
  authFetch(`${BASE_URL}/api/groups/${id}/join`, {
    method: "POST",
    body: JSON.stringify({ email }),
  }).then(r => r.json());

export const apiGetGroupMembers = (id) =>
  authFetch(`${BASE_URL}/api/groups/${id}/members`).then(r => r.json());

export const apiPostAvailability = (id, schedule_id, is_available) =>
  authFetch(`${BASE_URL}/api/groups/${id}/availability`, {
    method: "POST",
    body: JSON.stringify({ schedule_id, is_available }),
  }).then(r => r.json());

export const apiGetRecommend = (id) =>
  authFetch(`${BASE_URL}/api/groups/${id}/recommend`).then(r => r.json());

export const apiConfirmGroup = (id, start_time, end_time) =>
  authFetch(`${BASE_URL}/api/groups/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({ start_time, end_time }),
  }).then(r => r.json());

export const apiGetConfirm = (id) =>
  authFetch(`${BASE_URL}/api/groups/${id}/confirm`).then(r => r.json());

export const apiGetMyGroups = () =>
  authFetch(`${BASE_URL}/api/groups`).then(r => r.json());

export const apiDeleteGroup = (id) =>
  authFetch(`${BASE_URL}/api/groups/${id}`, {
    method: "DELETE",
  }).then(r => {
    if (!r.ok) throw new Error("삭제 실패");
    return r.json();
  });

export const apiUpdateNickname = (nickname) =>
  authFetch(`${BASE_URL}/api/users/me`, {
    method: "PATCH",
    body: JSON.stringify({ nickname }),
  }).then(r => {
    if (!r.ok) throw new Error("닉네임 변경 실패");
    return r.json();
  });

export const apiUpdatePassword = (password) =>
  authFetch(`${BASE_URL}/api/users/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  }).then(r => {
    if (!r.ok) throw new Error("비밀번호 변경 실패");
    return r.json();
  });