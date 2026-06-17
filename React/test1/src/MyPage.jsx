import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { usePlan } from "./PlanContext";

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
  const { user } = useUser();
  const { userPlans } = usePlan();
  const createdCount = userPlans.filter(p => p.isMine).length;
  const joinedCount = userPlans.filter(p => !p.isMine).length;

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
              <div onClick={() => alert("프로필 사진 변경 준비 중!")} style={{
                position: "absolute", bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: "50%",
                background: "#222222", border: "2px solid #111",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, cursor: "pointer",
              }}>✏️</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {user?.name || "사용자"}
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