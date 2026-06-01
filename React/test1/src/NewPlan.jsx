import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";
import api from "./api";

const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

function Tag({ label, onRemove, onClick }) {
  return (
    <span onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#222222", color: "#aaa",
      borderRadius: 8, padding: "5px 12px",
      fontSize: 13, fontWeight: 600,
      border: "1px solid #2a2a2a",
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => { if(onClick) e.currentTarget.style.borderColor = "#3b6ef8"; }}
      onMouseLeave={e => { if(onClick) e.currentTarget.style.borderColor = "#2a2a2a"; }}
    >
      {label}
      <span onClick={e => { e.stopPropagation(); onRemove && onRemove(); }} style={{ cursor: "pointer", color: "#888", fontSize: 14 }}>✕</span>
    </span>
  );
}

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

function TimeInput({ value, onChange, placeholder }) {
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
      <input
        value={h}
        onChange={e => handleHour(e.target.value)}
        placeholder="시"
        maxLength={2}
        style={{ ...inputStyle, width: "100%", textAlign: "center" }}
      />
      <span style={{ color: "#555", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>:</span>
      <input
        value={m}
        onChange={e => handleMin(e.target.value)}
        placeholder="분"
        maxLength={2}
        style={{ ...inputStyle, width: "100%", textAlign: "center" }}
      />
    </div>
  );
}

export default function NewPlan() {
  const { addBlock, addPlan } = usePlan();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("새 모임");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState(":");
  const [endTime, setEndTime] = useState(":");
  const [places, setPlaces] = useState([]);
  const [placeInput, setPlaceInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState("");

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "새 모임") return;
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

  const addPlace = () => {
    if (!placeInput.trim()) return;
    setPlaces(prev => [...prev, placeInput.trim()]);
    setPlaceInput("");
  };

  const removePlace = (i) => setPlaces(prev => prev.filter((_, idx) => idx !== i));

  const fillPlaceInput = (p) => setPlaceInput(p);
  const fillParticipantInput = (p) => setParticipantInput(p);

  const addParticipant = () => {
    if (!participantInput.trim()) return;
    setParticipants(prev => [...prev, participantInput.trim()]);
    setParticipantInput("");
  };

  const removeParticipant = (i) => setParticipants(prev => prev.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!title.trim()) { alert("플랜 제목을 입력해주세요!"); return; }

    // ⭐️ 날짜 변환 로직: "2026. 5. 31"을 "2026-05-31T23:59:59Z" 형태로 바꿔줍니다.
    let formattedDeadline = "2026-12-31T23:59:59Z"; // 아무것도 입력 안 했을 때 기본값
    
    if (endDate) {
      const parts = endDate.split('.').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        formattedDeadline = `${y}-${m}-${d}T23:59:59Z`; 
      }
    }

    try {
      // 1. 서버로 변환된 날짜 전송
      const response = await api.post("/api/groups", {
        title: title,
        description: "", 
        deadline: formattedDeadline
      });

      const newGroupId = response.data.group_plan_id; 

      // 2. 입력된 시간 처리 (시작 시간 / 종료 시간 분리)
      const parseHour = (timeStr) => {
        if (!timeStr) return 9;
        const [h] = timeStr.split(":");
        return parseInt(h) || 9;
      };

      const parseMinute = (timeStr) => {
        if (!timeStr) return 0;
        const [, m] = timeStr.split(":");
        return parseInt(m) || 0;
      };

      const startH = parseHour(startTime);
      const startM = parseMinute(startTime);
      const endH = parseHour(endTime) || startH + 1;
      const endM = parseMinute(endTime);

      // ⭐️ 핵심 수정: 입력받은 시작 날짜(startDate)로 실제 요일 인덱스 구하기
      let dayIndex = 1; // 변환 실패 시 기본 월요일(1)
      if (startDate) {
        // "2026. 6. 1" -> "2026-6-1" 표준 포맷 변환
        const cleanDate = startDate.replace(/\s/g, "").replace(/\./g, "-");
        const dateObj = new Date(cleanDate);
        if (!isNaN(dateObj.getTime())) {
          const day = dateObj.getDay(); // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
          // 캘린더가 월(1)~일(7) 체계를 주로 쓰므로 이에 맞게 매핑 (필요시 수정)
          dayIndex = day === 0 ? 7 : day; 
        }
      }

      // 3. 프론트엔드 UI 상태 업데이트
      addBlock({
        planId: newGroupId, 
        day: dayIndex, // 👈 동적으로 계산된 요일 적용
        startHour: startH,
        startMinute: startM, // 👈 분 단위 추가 전달
        endHour: endH,
        endMinute: endM, // 👈 분 단위 추가 전달
        type: "blue",
        title,
        avatars: [],
        extra: participants.length,
      });

      addPlan({
        id: newGroupId, 
        title,
        status: "확정",
        date: startDate ? startDate.replace(/\s/g, "").replace(/\./g, "-") : "날짜 미정", // 캘린더 인식용 표준 포맷 변환
        time: `${startTime || "00:00"} - ${endTime || "00:00"}`,
        location: places[0] || "장소 미정",
        count: participants.length,
        isMine: true,
        confirmed: true,
        dateRange: `${startDate || "미정"} ~ ${endDate || "미정"}`,
        bestTime: `${startDate || ""} ${startTime || "--"} ~ ${endTime || "--"}`,
        totalCount: participants.length,
        votedCount: 0,
        places: places.map(p => ({ name: p, votes: 0 })),
        participants: participants.map(p => ({ name: p, voted: false })),
        memo: "",
      });

      alert(`"${title}" 모임이 성공적으로 생성되었습니다!`);
      navigate("/home");

    } catch (error) {
      console.error("방 생성 에러:", error);
      if (error.response && error.response.data) {
        alert(`백엔드 거절 사유: ${JSON.stringify(error.response.data)}`);
      } else { 
        alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
      }
    }
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
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid #2a2a2a",
          background: "#111111", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{
              display: "none", background: "none", border: "none",
              color: "#fff", fontSize: 22, cursor: "pointer", padding: "0 4px"
            }}>☰</button>
            <span style={{ fontSize: 18, fontWeight: 700 }}>새 모임 만들기</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              background: "#3b6ef8", color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>🔗 공유하기</button>
            <span style={{ color: "#888", fontSize: 13 }}>ENG | KOR</span>
            <span style={{ color: "#888", fontSize: 16 }}>ℹ️</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px", maxWidth: 700 }}>
          <div style={{
            background: "#1a1a1a", borderRadius: 14, padding: "24px",
            border: "1px solid #2a2a2a", marginBottom: 16,
          }}>
            <Field label="플랜 제목" icon="✏️">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="플랜 제목을 입력하세요" style={inputStyle} />
            </Field>

            <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
              <Field label="시작 날짜" icon="📅">
                <input value={startDate} onChange={e => setStartDate(e.target.value)}
                  placeholder="년. 월. 일." style={{ ...inputStyle, width: "100%" }} />
              </Field>
              <Field label="종료 날짜" icon="📅">
                <input value={endDate} onChange={e => setEndDate(e.target.value)}
                  placeholder="년. 월. 일." style={{ ...inputStyle, width: "100%" }} />
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

          <div style={{
            background: "#1a1a1a", borderRadius: 14, padding: "24px",
            border: "1px solid #2a2a2a", marginBottom: 24,
          }}>
            <Field label="장소 옵션" icon="📍">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {places.map((p, i) => (
                  <Tag
                    key={i}
                    label={p}
                    onRemove={() => removePlace(i)}
                    onClick={() => fillPlaceInput(p)}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={placeInput}
                  onChange={e => setPlaceInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addPlace()}
                  placeholder="장소를 추가하세요"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addPlace} style={{
                  width: 42, height: 42, borderRadius: 10, background: "#3b6ef8",
                  border: "none", color: "#fff", fontSize: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>+</button>
              </div>
            </Field>

            <div style={{ marginTop: 24 }}>
              <Field label="참여자" icon="👥">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {participants.map((p, i) => (
                    <Tag
                      key={i}
                      label={p}
                      onRemove={() => removeParticipant(i)}
                      onClick={() => fillParticipantInput(p)}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={participantInput}
                    onChange={e => setParticipantInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addParticipant()}
                    placeholder="이름, 아이디 또는 이메일을 입력하세요"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={addParticipant} style={{
                    width: 42, height: 42, borderRadius: 10, background: "#3b6ef8",
                    border: "none", color: "#fff", fontSize: 20, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>+</button>
                </div>
              </Field>
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