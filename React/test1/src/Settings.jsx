import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? "#3b6ef8" : "#444",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 2,
        left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
      }} />
    </div>
  );
}


function Row({ label, value, action, actionColor = "#3b6ef8", toggle, onToggle, onClick, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: last ? "none" : "1px solid #2a2a2a",
    }}>
      <span style={{ fontSize: 14, color: "#ddd" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {value && <span style={{ fontSize: 14, color: "#666" }}>{value}</span>}
        {action && (
          <span onClick={onClick} style={{
            fontSize: 14, color: actionColor, cursor: "pointer", fontWeight: 500
          }}>{action}</span>
        )}
        {toggle !== undefined && (
          <Toggle on={toggle} onChange={onToggle} />
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("설정");
  const [inviteAlarm, setInviteAlarm] = useState(true);
  const [voteAlarm, setVoteAlarm] = useState(false);
  const [scheduleAlarm, setScheduleAlarm] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFormat, setTimeFormat] = useState("12시간");
  const [theme] = useState("다크");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { user, logout } = useUser();

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "새 모임") { navigate("/newplan"); return; }
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 항목을 입력해주세요."); return;
    }
    if (newPassword.length < 6) {
      setPasswordError("비밀번호는 6자 이상이어야 합니다."); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다."); return;
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setPasswordSuccess(false);
    }, 1500);
  };

  const handleTimeFormat = () => {
    setTimeFormat(prev => prev === "12시간" ? "24시간" : "12시간");
  };

 

  const bg = theme === "다크" ? "#111111" : "#f5f5f5";
  const cardBg = theme === "다크" ? "#1a1a1a" : "#ffffff";
  const border = theme === "다크" ? "#2a2a2a" : "#e0e0e0";
  const textMain = theme === "다크" ? "#fff" : "#111";

  return (
    <div className="page-fade" style={{
      display: "flex", height: "100vh", width: "100vw",
      background: bg, color: textMain,
      fontFamily: "'Noto Sans KR', sans-serif",
      overflow: "hidden",
      transition: "background 0.3s, color 0.3s",
    }}>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(false); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: cardBg, borderRadius: 14, padding: "28px",
            minWidth: 340, border: `1px solid ${border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: textMain }}>비밀번호 변경</p>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(false); }} style={{
                background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
              }}>✕</button>
            </div>

            {passwordSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: textMain }}>비밀번호가 변경되었습니다!</p>
              </div>
            ) : (
              <>
                {[
                  { label: "현재 비밀번호", val: oldPassword, set: setOldPassword },
                  { label: "새 비밀번호", val: newPassword, set: setNewPassword },
                  { label: "새 비밀번호 확인", val: confirmPassword, set: setConfirmPassword },
                ].map(({ label, val, set }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 6 }}>{label}</label>
                    <input
                      type="password"
                      value={val}
                      onChange={e => { set(e.target.value); setPasswordError(""); }}
                      style={{
                        width: "100%", background: "#222222", border: `1px solid ${passwordError ? "#e05555" : border}`,
                        borderRadius: 8, padding: "11px 14px", fontSize: 14,
                        color: textMain, outline: "none", boxSizing: "border-box",
                        fontFamily: "'Noto Sans KR', sans-serif",
                      }}
                    />
                  </div>
                ))}
                {passwordError && <p style={{ fontSize: 12, color: "#e05555", marginBottom: 12 }}>{passwordError}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); }} style={{
                    flex: 1, background: "#222222", border: `1px solid ${border}`,
                    color: "#aaa", borderRadius: 8, padding: "12px 0", fontSize: 14, cursor: "pointer"
                  }}>취소</button>
                  <button onClick={handlePasswordChange} style={{
                    flex: 1, background: "#3b6ef8", border: "none",
                    color: "#fff", borderRadius: 8, padding: "12px 0",
                    fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>변경</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10, display: "none"
        }} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} style={{
        width: 180, background: bg,
        borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column",
        padding: "24px 0", flexShrink: 0,
        transition: "transform 0.3s ease", zIndex: 20,
      }}>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn" style={{
          display: "none", position: "absolute", top: 16, right: 12,
          background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
        }}>✕</button>

        <div onClick={() => navigate("/home")} style={{
          padding: "0 20px 28px", fontSize: 20, fontWeight: 700, color: textMain, cursor: "pointer"
        }}>
          상대성 시간
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} onClick={() => handleNavClick(item.label)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 20px", cursor: "pointer",
              borderRadius: 8, margin: "2px 8px",
              background: activeNav === item.label ? "#222222" : "transparent",
              color: activeNav === item.label ? "#fff" : "#888",
              fontSize: 14, fontWeight: activeNav === item.label ? 600 : 400,
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "11px 20px", color: "#fff", fontSize: 14, cursor: "pointer",
          background: "#222222", borderRadius: 8, margin: "2px 8px",
          borderTop: `1px solid ${border}`,
        }}>
          <span>⚙️</span> 설정
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "16px 24px", borderBottom: `1px solid ${border}`, flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{
            display: "none", background: "none", border: "none",
            color: textMain, fontSize: 22, cursor: "pointer", padding: "0 4px"
          }}>☰</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: textMain }}>설정</span>
        </div>

        {/* Settings content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: textMain, marginBottom: 12 }}>계정</div>
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${border}`, overflow: "hidden" }}>
              <Row label="이메일" value={user?.email || "이메일 없음"} last={false} />
              <Row label="비밀번호 변경" action="변경" onClick={() => setShowPasswordModal(true)} last={true} />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: textMain, marginBottom: 12 }}>알림</div>
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${border}`, overflow: "hidden" }}>
              <Row label="초대 알림" toggle={inviteAlarm} onToggle={setInviteAlarm} last={false} />
              <Row label="투표 알림" toggle={voteAlarm} onToggle={setVoteAlarm} last={false} />
              <Row label="일정 확정 알림" toggle={scheduleAlarm} onToggle={setScheduleAlarm} last={true} />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: textMain, marginBottom: 12 }}>환경</div>
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${border}`, overflow: "hidden" }}>
              <Row label="시간 형식" value={timeFormat} action="변경" onClick={handleTimeFormat} last={false} />
              
            </div>
          </div>

          <button onClick={() => { logout(); navigate("/"); }} style={{
            width: "100%", background: "transparent", border: "1px solid #e84040",
            color: "#e84040", borderRadius: 10, padding: "14px 0",
            fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8,
            transition: "background 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e84040"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e84040"; }}
          >로그아웃</button>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar-open { transform: translateX(0%) !important; }
          .sidebar-close-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}