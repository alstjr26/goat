import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { usePlan } from "./PlanContext";
import { apiUpdateNickname } from "./api";
const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("마이페이지");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser } = useUser();
const [showNicknameModal, setShowNicknameModal] = useState(false);
const [newNickname, setNewNickname] = useState("");
  const { userPlans } = usePlan();
  const createdCount = userPlans.filter(p => p.user_id === user?.id).length;
const joinedCount = userPlans.filter(p => p.user_id !== user?.id).length;
const handleNicknameChange = async () => {
  if (!newNickname.trim()) return;
  try {
    await apiUpdateNickname(newNickname.trim());
    setUser(prev => ({ ...prev, name: newNickname.trim() }));
    setShowNicknameModal(false);
    setNewNickname("");
  } catch (err) {
    alert("닉네임 변경에 실패했습니다.");
  }
};
  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "새 모임") { navigate("/newplan"); return; }
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "마이페이지") return;
  };

  return (
    <div className="page-fade" style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "#111111", color: "#fff",
      fontFamily: "'Noto Sans KR', sans-serif",
      overflow: "hidden",
    }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10, display: "none"
        }} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} style={{
        width: 180, background: "#111111",
        borderRight: "1px solid #2a2a2a",
        display: "flex", flexDirection: "column",
        padding: "24px 0", flexShrink: 0,
        zIndex: 20, transition: "transform 0.3s ease",
      }}>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn" style={{
          display: "none", position: "absolute", top: 16, right: 12,
          background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
        }}>✕</button>

        <div onClick={() => navigate("/home")} style={{
          padding: "0 20px 28px", fontSize: 20, fontWeight: 700, color: "#fff", cursor: "pointer"
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

        <div onClick={() => navigate("/settings")} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "11px 20px", color: "#888", fontSize: 14, cursor: "pointer",
          transition: "color 0.15s", borderTop: "1px solid #2a2a2a",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "#888"}
        >
          <span>⚙️</span> 설정
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto",
        scrollbarWidth: "none", msOverflowStyle: "none" }}>

        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", alignItems: "center",
          padding: "16px 24px", borderBottom: "1px solid #2a2a2a",
          background: "#111111", flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{
            display: "none", background: "none", border: "none",
            color: "#fff", fontSize: 22, cursor: "pointer", padding: "0 4px"
          }}>☰</button>
          <span style={{ fontSize: 18, fontWeight: 700 }}>마이페이지</span>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px", maxWidth: 900 }}>
          {/* 닉네임 변경 모달 */}
{showNicknameModal && (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
  }} onClick={() => { setShowNicknameModal(false); setNewNickname(""); }}>
    <div onClick={e => e.stopPropagation()} style={{
      background: "#1a1a1a", borderRadius: 14, padding: "28px",
      minWidth: 340, border: "1px solid #2a2a2a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>닉네임 변경</p>
        <button onClick={() => { setShowNicknameModal(false); setNewNickname(""); }} style={{
          background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
        }}>✕</button>
      </div>
      <input
        value={newNickname}
        onChange={e => setNewNickname(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleNicknameChange()}
        placeholder={user?.name || "닉네임을 입력하세요"}
        autoFocus
        style={{
          width: "100%", background: "#222222", border: "1px solid #2a2a2a",
          borderRadius: 8, padding: "12px 14px", fontSize: 14,
          color: "#fff", outline: "none", boxSizing: "border-box",
          fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 16,
        }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setShowNicknameModal(false); setNewNickname(""); }} style={{
          flex: 1, background: "#222222", border: "1px solid #2a2a2a",
          color: "#aaa", borderRadius: 8, padding: "12px 0", fontSize: 14, cursor: "pointer"
        }}>취소</button>
        <button onClick={handleNicknameChange} style={{
          flex: 1, background: "#3b6ef8", border: "none",
          color: "#fff", borderRadius: 8, padding: "12px 0",
          fontSize: 14, fontWeight: 700, cursor: "pointer"
        }}>변경</button>
      </div>
    </div>
  </div>
)}
          {/* 프로필 카드 */}
          <div style={{
            background: "#1a1a1a", borderRadius: 14, padding: "24px",
            border: "1px solid #2a2a2a", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#3b6ef8", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 32,
              }}>👤</div>
              
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {user?.name || "사용자"}
                </div>
                <button onClick={() => setShowNicknameModal(true)} style={{
                  background: "none", border: "none", color: "#888",
                  fontSize: 13, cursor: "pointer", padding: "2px 6px",
                  borderRadius: 4, transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#3b6ef8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888"}
                >✏️</button>
              </div>
              <div style={{ fontSize: 14, color: "#888" }}>
                {user?.email || "이메일 없음"}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{
              flex: 1, background: "#1a1a1a", borderRadius: 12, padding: "20px 24px",
              border: "1px solid #2a2a2a",
            }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>📅 생성한 일정</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{createdCount}개</div>
            </div>
            <div style={{
              flex: 1, background: "#1a1a1a", borderRadius: 12, padding: "20px 24px",
              border: "1px solid #2a2a2a",
            }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>👥 참여한 일정</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{joinedCount}개</div>
            </div>
          </div>
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