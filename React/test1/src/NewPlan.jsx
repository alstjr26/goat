import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";

const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

function Field({ label, icon, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#222222", border: "1px solid #2a2a2a",
  borderRadius: 10, padding: "13px 16px", fontSize: 14,
  color: "#fff", outline: "none", boxSizing: "border-box",
  fontFamily: "'Noto Sans KR', sans-serif",
};

function TimeInput({ value, onChange }) {
  const parts = value.split(":");
  const h = parts[0] || "";
  const m = parts[1] || "";

  const handleHour = (v) => {
    const num = v.replace(/\D/g, "").slice(0, 2);
    onChange(`${num}:${m}`);
  };

  const handleMin = (v) => {
    const num = v.replace(/\D/g, "").slice(0, 2);
    onChange(`${h}:${num}`);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
      <input value={h} onChange={e => handleHour(e.target.value)} placeholder="시" maxLength={2}
        style={{ ...inputStyle, width: "100%", textAlign: "center" }} />
      <span style={{ color: "#555", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>:</span>
      <input value={m} onChange={e => handleMin(e.target.value)} placeholder="분" maxLength={2}
        style={{ ...inputStyle, width: "100%", textAlign: "center" }} />
    </div>
  );
}

function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selected = value ? new Date(value) : null;

  const handleSelect = (day) => {
    const d = new Date(year, month, day);
    const str = `${d.getFullYear()}. ${String(d.getMonth()+1).padStart(2,'0')}. ${String(d.getDate()).padStart(2,'0')}`;
    onChange(str);
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!selected) return false;
    return selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
  };

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div onClick={() => setOpen(v => !v)} style={{
        ...inputStyle, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ color: value ? "#fff" : "#555" }}>{value || "년. 월. 일."}</span>
        <span style={{ color: "#555", fontSize: 14 }}>📅</span>
      </div>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
          padding: 16, width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", color: "#888", fontSize: 16, cursor: "pointer" }}>◀</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{year}년 {month + 1}월</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", color: "#888", fontSize: 16, cursor: "pointer" }}>▶</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#666", padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const today = new Date();
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const sel = isSelected(day);
              return (
                <div key={day} onClick={() => handleSelect(day)} style={{
                  textAlign: "center", padding: "6px 0", borderRadius: 6,
                  fontSize: 13, cursor: "pointer",
                  background: sel ? "#3b6ef8" : "transparent",
                  color: sel ? "#fff" : isToday ? "#3b6ef8" : "#ccc",
                  fontWeight: sel || isToday ? 700 : 400,
                  border: isToday && !sel ? "1px solid #3b6ef8" : "1px solid transparent",
                }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#222"; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                >{day}</div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <button onClick={() => { const t = new Date(); setViewDate(t); handleSelect(t.getDate()); }} style={{
              background: "none", border: "1px solid #2a2a2a", color: "#888",
              borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer",
            }}>오늘</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewPlan() {
  const { addBlock, createPlan } = usePlan();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("새 모임");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState(":");
  const [endTime, setEndTime] = useState(":");

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "새 모임") return;
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

  const parseDateTimeToISO = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const nums = dateStr.replace(/\./g, '').trim().split(' ').filter(Boolean).map(Number);
    const [y, m, d] = nums;
    const [h, min] = (timeStr || '0:0').split(':').map(v => parseInt(v) || 0);
    return new Date(y, m - 1, d, h, min, 0).toISOString();
  };

  const handleCreate = async () => {
    if (!title.trim()) { alert("플랜 제목을 입력해주세요!"); return; }

    const parseHour = (timeStr) => {
      if (!timeStr) return 9;
      const [h] = timeStr.split(":");
      return parseInt(h) || 9;
    };

    const startH = parseHour(startTime);
    const endH = parseHour(endTime) || startH + 1;
    const deadlineISO = parseDateTimeToISO(endDate || startDate, endTime);

    const result = await createPlan(
      title,
      `${startDate} ~ ${endDate}`,
      deadlineISO
    );

    if (!result.success) {
      alert(result.message || "약속 방 생성에 실패했어요.");
      return;
    }

    addBlock({
      planId: result.id, day: 1, startHour: startH, endHour: endH,
      type: "blue", title, avatars: [], extra: 0,
    });

    navigate("/home");
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

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} style={{
        width: 180, background: "#111111", borderRight: "1px solid #2a2a2a",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
        zIndex: 20, transition: "transform 0.3s ease",
      }}>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn" style={{
          display: "none", position: "absolute", top: 16, right: 12,
          background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
        }}>✕</button>

        <div onClick={() => navigate("/home")} style={{
          padding: "0 20px 28px", fontSize: 20, fontWeight: 700, color: "#fff", cursor: "pointer"
        }}>상대성 시간</div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} onClick={() => handleNavClick(item.label)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 20px", cursor: "pointer", borderRadius: 8, margin: "2px 8px",
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto",
        scrollbarWidth: "none", msOverflowStyle: "none" }}>

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
          <span style={{ fontSize: 18, fontWeight: 700 }}>새 모임 만들기</span>
        </div>

        <div style={{ padding: "24px 32px", maxWidth: 700 }}>
          <div style={{
            background: "#1a1a1a", borderRadius: 14, padding: "24px",
            border: "1px solid #2a2a2a", marginBottom: 24,
          }}>
            <Field label="플랜 제목" icon="✏️">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="플랜 제목을 입력하세요" style={inputStyle} />
            </Field>

            <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
              <Field label="시작 날짜" icon="📅">
                <DatePicker value={startDate} onChange={setStartDate} />
              </Field>
              <Field label="종료 날짜" icon="📅">
                <DatePicker value={endDate} onChange={setEndDate} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
              <div style={{ flex: 1 }}>
                <Field label="시작 시간" icon="🕐">
                  <TimeInput value={startTime} onChange={setStartTime} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="종료 시간" icon="🕐">
                  <TimeInput value={endTime} onChange={setEndTime} />
                </Field>
              </div>
            </div>
          </div>

          <button onClick={handleCreate} style={{
            width: "100%", background: "#3b6ef8", color: "#fff",
            border: "none", borderRadius: 12, padding: "16px 0",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a5de0"}
            onMouseLeave={e => e.currentTarget.style.background = "#3b6ef8"}
          >플랜 생성</button>
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