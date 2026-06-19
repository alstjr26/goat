import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";
import { useUser } from "./UserContext";

const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

const INIT_PLANS = [];

function StatusBadge({ status }) {
  const colors = {
    "확정": { bg: "#1a3a2a", color: "#4caf80" },
    "취소됨": { bg: "#3a1a1a", color: "#e05555" },
    "완료": { bg: "#2a2a2a", color: "#888" },
    "투표 진행중": { bg: "#2a2a1a", color: "#f4a429" },
  };
  const c = colors[status] || colors["완료"];
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 12, fontWeight: 600,
    }}>{status}</span>
  );
}

function PlanCard({ plan, onClick, onDelete }) {
  const isConfirmed = plan.status === "확정";
  const isCancelled = plan.status === "취소됨";
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: 12,
      padding: "18px 24px", marginBottom: 12,
      border: "1px solid #2a2a2a",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative", transition: "border-color 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#3a3a3a"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
    >
      <button onClick={e => { e.stopPropagation(); onDelete(plan.id); }} style={{
        position: "absolute", top: 10, right: 10,
        background: "none", border: "none",
        color: "#555", fontSize: 14, cursor: "pointer",
        lineHeight: 1, padding: 2, transition: "color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
        onMouseLeave={e => e.currentTarget.style.color = "#555"}
      >✕</button>

      <div onClick={onClick} style={{ flex: 1, cursor: "pointer", paddingRight: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{plan.title}</span>
          <StatusBadge status={plan.status} />
          {plan.isMine && (
            <span style={{
              background: "#1a2a4a", color: "#5b8af8",
              borderRadius: 20, padding: "3px 10px",
              fontSize: 12, fontWeight: 600,
            }}>내가 생성</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#888", fontSize: 13 }}>
          <span>📅 {plan.date}</span>
          <span>{plan.time}</span>
        </div>
      </div>

      <div style={{ marginLeft: 16, flexShrink: 0 }}>
        {isConfirmed && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid #4caf80",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4caf80", fontSize: 16,
          }}>✓</div>
        )}
        {isCancelled && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid #e05555",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#e05555", fontSize: 16,
          }}>✕</div>
        )}
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("참여 기록");
  const [filter, setFilter] = useState("전체");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userPlans, removePlan } = usePlan();
  const { user } = useUser();
  const [plans, setPlans] = useState(INIT_PLANS);
  const [deleteTarget, setDeleteTarget] = useState(null);

  
const normalizePlan = (p) => {
  console.log("owner_id:", p.owner_id, "user.id:", user?.id);
  return {
    id: p.group_plan_id,
    title: p.title,
    status: p.status === "CONFIRMED" ? "확정" : "투표 진행중",
    date: p.deadline ? new Date(p.deadline).toLocaleDateString() : "날짜 미정",
    time: p.deadline ? new Date(p.deadline).toLocaleTimeString() : "-",
    isMine: p.owner_id === user?.id,
  };
};
  const allPlans = user ? [...plans, ...userPlans.map(normalizePlan)] : [...plans];

  const filters = ["전체", "생성한 플랜", "참여한 플랜"];

  const filtered = allPlans.filter(p => {
    if (filter === "생성한 플랜") return p.isMine;
    if (filter === "참여한 플랜") return !p.isMine;
    return true;
  });

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "참여 기록") return;
    if (label === "새 모임") { navigate("/newplan"); return; }
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

  const confirmDelete = async () => {
    setPlans(prev => prev.filter(p => p.id !== deleteTarget));
    const result = await removePlan(deleteTarget);
    if (result && !result.success) {
      alert(result.message || "삭제에 실패했습니다.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="page-fade" style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "#111111", color: "#fff",
      fontFamily: "'Noto Sans KR', sans-serif",
      overflow: "hidden",
    }}>
      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setDeleteTarget(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a1a", borderRadius: 14, padding: "28px",
            minWidth: 300, border: "1px solid #2a2a2a",
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>기록 삭제</p>
            <p style={{ fontSize: 14, color: "#aaa", marginBottom: 24 }}>삭제하시겠습니까?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                flex: 1, background: "#222222", border: "1px solid #2a2a2a",
                color: "#aaa", borderRadius: 8, padding: "12px 0", fontSize: 14, cursor: "pointer"
              }}>취소</button>
              <button onClick={confirmDelete} style={{
                flex: 1, background: "#e05555", border: "none",
                color: "#fff", borderRadius: 8, padding: "12px 0",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>삭제</button>
            </div>
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
          padding: "0 20px 28px", fontSize: 20, fontWeight: 700,
          color: "#fff", cursor: "pointer",
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" }}>
        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid #2a2a2a",
          background: "#111111", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{
              display: "none", background: "none", border: "none",
              color: "#fff", fontSize: 22, cursor: "pointer", padding: "0 4px"
            }}>☰</button>
            <span style={{ fontSize: 18, fontWeight: 700 }}>참여 기록</span>
          </div>
        </div>

        {/* 필터 탭 */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2a2a", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "1px solid #2a2a2a",
                background: filter === f ? "#3b6ef8" : "transparent",
                color: filter === f ? "#fff" : "#888",
                transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* 플랜 목록 */}
        <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", width: "100%" }}>
          {filtered.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flex: 1,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: "#222222", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 36, marginBottom: 20,
              }}>🕐</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                아직 참여한 모임이 없습니다.
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                친구들과 함께 첫 모임을 만들어보세요.
              </div>
            </div>
          ) : (
            filtered.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onClick={() => navigate(`/group/${plan.id}`)}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0%) !important; }
          .sidebar-close-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}