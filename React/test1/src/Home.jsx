import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";

const DAYS_OF_WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = ["7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12am"];
const AVATARS = [
  { id: 1, color: "#e8a87c" },
  { id: 2, color: "#7c9ee8" },
  { id: 3, color: "#e87c9a" },
  { id: 4, color: "#7ce8b0" },
];

function Avatar({ color, size = 28, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, border: "2px solid #1a1a1a",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, color: "#fff", fontWeight: 700,
      flexShrink: 0, ...style
    }} />
  );
}

function AvatarGroup({ avatars, extra, size = 26, showText = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {avatars.map((a, i) => (
          <Avatar key={a.id} color={a.color} size={size}
            style={{ marginLeft: i === 0 ? 0 : -8, zIndex: avatars.length - i }} />
        ))}
        {!showText && extra > 0 && (
          <div style={{
            width: size, height: size, borderRadius: "50%",
            background: "#333", border: "2px solid #1a1a1a",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#aaa", fontWeight: 700, marginLeft: -8
          }}>+{extra}</div>
        )}
      </div>
      {showText && extra > 0 && (
        <span style={{ color: "#aaa", fontSize: 13 }}>+{extra}명 참여</span>
      )}
    </div>
  );
}

const INIT_BLOCKS = [];
const CELL_HEIGHT = 54; 
const START_HOUR = 7; // 오전 7시 시작

// 시간 포맷 헬퍼 (hh:mm 출력)
const formatTimeOnly = (dateObj) => {
  const h = dateObj.getHours();
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

function CalendarBlock({ block, onClick }) {
  const evStart = new Date(block.computedStart);
  const evEnd = new Date(block.computedEnd);

  // 현재 뷰포트 기준(오전 7시 ~ 밤 12시) 안으로 시간을 제한
  const startMins = Math.max(evStart.getHours() * 60 + evStart.getMinutes(), START_HOUR * 60);
  const endMins = Math.min(evEnd.getHours() * 60 + evEnd.getMinutes(), 24 * 60);

  // 만약 24:00에 도달했거나 익일 새벽이라 시간 연산이 0이 되는 조건 제어
  const displayEndMins = (evEnd.getDate() !== evStart.getDate() || (evEnd.getHours() === 0 && evEnd.getMinutes() === 0)) ? 24 * 60 : endMins;

  const startOffsetMins = startMins - (START_HOUR * 60);
  const durationMins = displayEndMins - startMins;

  const top = (startOffsetMins / 60) * CELL_HEIGHT;
  const height = (durationMins / 60) * CELL_HEIGHT;

  const isBlue = block.type === "blue";
  if (height <= 0) return null;

  // 원본 시간 안내 라벨 구성
  const origStart = new Date(block.realStart);
  const origEnd = new Date(block.realEnd);

  return (
    <div onClick={onClick} style={{
      position: "absolute",
      top: top + 2, left: 4, right: 4,
      height: height - 4,
      background: isBlue ? "#3b6ef8" : (block.type === "gray-light" ? "#2a2a2a" : "#222222"),
      borderRadius: 8,
      padding: isBlue ? "6px 10px" : "4px 8px",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-start", gap: 2,
      cursor: "pointer", transition: "filter 0.15s",
      zIndex: 5,
      overflow: "hidden"
    }}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
      onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
    >
      {isBlue && block.avatars && block.avatars.length > 0 && (
        <AvatarGroup avatars={block.avatars} extra={block.extra} size={24} />
      )}
      {block.title && (
        <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {block.title}
        </div>
      )}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
        {formatTimeOnly(origStart)} - {formatTimeOnly(origEnd)}
      </div>
    </div>
  );
}

const INIT_RECOMMENDED = [
  { day: "월요일 5/4", time: "2:00 pm - 3:00 pm", location: "성수동", count: 7 },
  { day: "수요일 5/6", time: "10:00 am - 11:00 am", location: "강남역", count: 5 },
  { day: "금요일 5/8", time: "3:00 pm - 4:30 pm", location: "홍대입구", count: 4 },
];

const INIT_PLACES = [
  { name: "성수동", votes: 5 },
  { name: "강남역", votes: 3 },
  { name: "홍대입구", votes: 3 },
];

const NAV_ITEMS = [
  { label: "새 모임", icon: "+" },
  { label: "내 일정", icon: "📅" },
  { label: "참여 기록", icon: "🕐" },
  { label: "마이페이지", icon: "👤" },
];

function Modal({ title, children, onClose, onDelete }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1a1a1a", borderRadius: 14, padding: "28px 28px 24px",
        minWidth: 320, maxWidth: 420, width: "90%",
        border: "1px solid #2a2a2a", position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{title}</span>
          <button onClick={onDelete || onClose} style={{
            background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer"
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const { userBlocks, removeBlock } = usePlan();
  const navigate = useNavigate();
  const [view, setView] = useState("전체 결과 보기");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [places, setPlaces] = useState(INIT_PLACES);
  const [myVote, setMyVote] = useState(null);
  const [modal, setModal] = useState(null);
  const [newPlace, setNewPlace] = useState("");
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [initBlocks, setInitBlocks] = useState(INIT_BLOCKS);

  // 오늘 날짜 기준으로 월요일 계산 및 주차 이동 처리
  const today = new Date();
  const startOfWeek = new Date(today);
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  startOfWeek.setDate(today.getDate() - distanceToMonday + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  // 일주일치 날짜 객체 생성
  const weekDaysObjs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const DAYS = weekDaysObjs.map(d => {
    return `${DAYS_OF_WEEK_KO[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`;
  });

  const month = startOfWeek.getMonth() + 1;
  const weekNum = Math.ceil(startOfWeek.getDate() / 7);

  const closeModal = () => setModal(null);

  const handleVotePlace = (name) => {
    if (myVote === name) {
      setPlaces(prev => prev.map(p => p.name === name ? { ...p, votes: p.votes - 1 } : p));
      setMyVote(null);
    } else {
      setPlaces(prev => prev.map(p => {
        if (p.name === name) return { ...p, votes: p.votes + 1 };
        if (p.name === myVote) return { ...p, votes: p.votes - 1 };
        return p;
      }));
      setMyVote(name);
    }
  };

  const handleAddPlace = () => {
    if (!newPlace.trim()) return;
    setPlaces(prev => [...prev, { name: newPlace.trim(), votes: 0 }]);
    setNewPlace("");
    setShowAddPlace(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("링크가 복사되었습니다!"))
      .catch(() => alert("링크: " + window.location.href));
  };

  const handleLoadSchedule = () => {
    setModal({
      type: "schedule",
      content: (
        <div>
          <p style={{ color: "#aaa", fontSize: 14, marginBottom: 16 }}>연동할 캘린더를 선택하세요</p>
          {["Google 캘린더", "Apple 캘린더", "Outlook"].map(cal => (
            <button key={cal} onClick={() => { alert(`${cal} 연동 준비 중입니다!`); closeModal(); }} style={{
              width: "100%", background: "#222222", border: "1px solid #2a2a2a",
              color: "#fff", borderRadius: 8, padding: "12px 16px",
              fontSize: 14, cursor: "pointer", marginBottom: 8, textAlign: "left"
            }}>{cal}</button>
          ))}
        </div>
      )
    });
  };

  const handleVote = () => {
    if (!myVote) { setModal({ type: "noVote", content: <p style={{color:"#aaa", fontSize:14}}>장소를 먼저 선택해주세요!</p> }); return; }
    setModal({
      type: "vote",
      content: (
        <div>
          <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>
            <b style={{ color: "#fff" }}>{myVote}</b>에 투표하시겠습니까?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeModal} style={{
              flex: 1, background: "#222222", border: "1px solid #2a2a2a",
              color: "#aaa", borderRadius: 8, padding: "12px 0", fontSize: 14, cursor: "pointer"
            }}>취소</button>
            <button onClick={() => { alert("투표 완료!"); closeModal(); }} style={{
              flex: 1, background: "#3b6ef8", border: "none",
              color: "#fff", borderRadius: 8, padding: "12px 0", fontSize: 14,
              fontWeight: 700, cursor: "pointer"
            }}>확인</button>
          </div>
        </div>
      )
    });
  };

  const handleBlockClick = (block) => {
    const origStart = new Date(block.realStart);
    const origEnd = new Date(block.realEnd);
    
    setModal({
      type: "block",
      block: block,
      content: (
        <div>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>📅 전체 기간: {origStart.getMonth() + 1}/{origStart.getDate()} ~ {origEnd.getMonth() + 1}/{origEnd.getDate()}</p>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            {formatTimeOnly(origStart)} ~ {formatTimeOnly(origEnd)}
          </p>
          {block.title && (
            <p style={{ color: "#fff", fontSize: 14, marginBottom: 4 }}>📋 {block.title}</p>
          )}
          {block.type === "blue" && (
            <p style={{ color: "#7090f8", fontSize: 13, marginTop: 8 }}>
              👥 {(block.avatars?.length || 0) + (block.extra || 0)}명 가능
            </p>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={closeModal} style={{
              flex: 1, background: "#222222", border: "1px solid #2a2a2a",
              color: "#aaa", borderRadius: 8, padding: "12px 0",
              fontSize: 14, cursor: "pointer"
            }}>닫기</button>
            {block.planId && (
              <button onClick={() => { setDeleteConfirm(block); closeModal(); }} style={{
                flex: 1, background: "#e05555", border: "none",
                color: "#fff", borderRadius: 8, padding: "12px 0",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>삭제</button>
            )}
          </div>
        </div>
      )
    });
  };

  const handleRecommendClick = (r) => {
    setModal({
      type: "recommend",
      content: (
        <div>
          <p style={{ color: "#7090f8", fontSize: 12, marginBottom: 6 }}>✨ Best match</p>
          <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{r.time}</p>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 4 }}>📅 {r.day}</p>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>📍 {r.location} &nbsp; 👥 {r.count}명 가능</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeModal} style={{
              flex: 1, background: "#222222", border: "1px solid #2a2a2a",
              color: "#aaa", borderRadius: 8, padding: "11px 0", fontSize: 13, cursor: "pointer"
            }}>닫기</button>
            <button onClick={() => { alert("일정이 확정되었습니다!"); closeModal(); }} style={{
              flex: 1, background: "#3b6ef8", border: "none",
              color: "#fff", borderRadius: 8, padding: "11px 0",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>이 시간으로 확정</button>
          </div>
        </div>
      )
    });
  };

  const openSettings = () => navigate("/settings");

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "새 모임") { navigate("/newplan"); return; }
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

  // 실제 Plan에서 넘어온 블록 조립 및 분 단위 깨짐 보정
  const processedUserBlocks = userBlocks.map(block => {
    let start = block.realStart ? new Date(block.realStart) : new Date(2026, 5, 1, 15, 0);
    let end = block.realEnd ? new Date(block.realEnd) : new Date(2026, 5, 2, 16, 30);

    if (block.startHour !== undefined) {
      const sh = Math.floor(Number(block.startHour));
      const sm = Math.round((Number(block.startHour) % 1) * 60) || Number(block.startMinute) || 0;
      start.setHours(sh, sm, 0, 0);
    }
    if (block.endHour !== undefined) {
      const eh = Math.floor(Number(block.endHour));
      const em = Math.round((Number(block.endHour) % 1) * 60) || Number(block.endMinute) || 0;
      end.setHours(eh, em, 0, 0);
    }

    return {
      ...block,
      title: block.title || "GOAT 미팅",
      type: "blue",
      avatars: AVATARS.slice(0, 2),
      extra: 1,
      realStart: start,
      realEnd: end
    };
  });

  const allCombinedBlocks = [...initBlocks, ...processedUserBlocks];

  return (
    <div className="page-fade" style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "#111111", color: "#fff",
      fontFamily: "'Noto Sans KR', sans-serif",
      overflow: "hidden",
    }}>

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a1a", borderRadius: 14, padding: "28px",
            minWidth: 300, border: "1px solid #2a2a2a",
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>일정 삭제</p>
            <p style={{ fontSize: 14, color: "#aaa", marginBottom: 24 }}>삭제하시겠습니까?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, background: "#222222", border: "1px solid #2a2a2a",
                color: "#aaa", borderRadius: 8, padding: "12px 0", fontSize: 14, cursor: "pointer"
              }}>취소</button>
              <button onClick={() => {
                if (deleteConfirm.planId) {
                  removeBlock(deleteConfirm.planId);
                } else {
                  setInitBlocks(prev => prev.filter(b => b !== deleteConfirm));
                }
                setDeleteConfirm(null);
              }} style={{
                flex: 1, background: "#e05555", border: "none",
                color: "#fff", borderRadius: 8, padding: "12px 0",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={
          modal.type === "schedule" ? "내 일정 불러오기" :
          modal.type === "vote" ? "장소 투표" :
          modal.type === "newplan" ? "새 모임 만들기" :
          modal.type === "block" ? "일정 상세" :
          modal.type === "recommend" ? "추천 일정" :
          modal.type === "noVote" ? "알림" : ""
        } onClose={closeModal}
          onDelete={modal?.block ? () => { setDeleteConfirm(modal.block); closeModal(); } : null}
        >
          {modal.content}
        </Modal>
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

        <div onClick={openSettings} style={{
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

      {/* Main Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>

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
            <span style={{ fontSize: 18, fontWeight: 700 }}>GOAT 미팅</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setWeekOffset(prev => prev - 1)} style={{
                background: "none", border: "none", color: "#888",
                fontSize: 16, cursor: "pointer", padding: "4px 6px",
              }}>◀</button>
              <span style={{ color: "#aaa", fontSize: 14, fontWeight: 500 }}>{month}월 {weekNum}주차</span>
              <button onClick={() => setWeekOffset(prev => prev + 1)} style={{
                background: "none", border: "none", color: "#888",
                fontSize: 16, cursor: "pointer", padding: "4px 6px",
              }}>▶</button>
              <button onClick={() => setWeekOffset(0)} style={{
                background: "#222222", border: "1px solid #2a2a2a",
                color: "#aaa", borderRadius: 6, padding: "3px 10px",
                fontSize: 12, cursor: "pointer",
              }}>오늘</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleShare} style={{
              background: "#3b6ef8", color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>🔗 공유하기</button>
            <span className="lang-label" style={{ color: "#888", fontSize: 13 }}>ENG | KOR</span>
          </div>
        </div>

        {/* Sub toolbar */}
        <div style={{
          position: "sticky", top: 57, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", borderBottom: "1px solid #2a2a2a",
          background: "#111111", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["내 시간 선택", "전체 결과 보기"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "none",
                background: view === v ? "#3b6ef8" : "#222222",
                color: view === v ? "#fff" : "#aaa",
              }}>{v}</button>
            ))}
          </div>
          <AvatarGroup avatars={AVATARS.slice(0, 3)} extra={7} size={28} showText={true} />
        </div>

        {/* 캘린더 판넬 */}
        <div style={{ display: "flex", flex: 1 }}>
          <div style={{ flex: 1, padding: "0 0 24px 24px", minWidth: 0 }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: 52, flexShrink: 0 }}>
                <div style={{ height: 36 }} />
                {HOURS.map(h => (
                  <div key={h} style={{
                    height: CELL_HEIGHT, display: "flex", alignItems: "flex-start",
                    paddingTop: 6, color: "#555", fontSize: 12,
                  }}>{h}</div>
                ))}
              </div>
              
              {DAYS.map((day, di) => {
                const targetDayObj = weekDaysObjs[di];
                
                // 해당 일의 '오전 7시' 경계 설정
                const dayStartBoundary = new Date(targetDayObj);
                dayStartBoundary.setHours(START_HOUR, 0, 0, 0);

                // 해당 일의 '오후 24시(다음날 00시)' 경계 설정
                const dayEndBoundary = new Date(targetDayObj);
                dayEndBoundary.setDate(targetDayObj.getDate() + 1);
                dayEndBoundary.setHours(0, 0, 0, 0);

                return (
                  <div key={day} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      height: 36, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 12, color: "#aaa",
                      fontWeight: 500, borderBottom: "1px solid #2a2a2a",
                    }}>{day}</div>
                    <div style={{ position: "relative" }}>
                      {HOURS.map(h => (
                        <div key={h} style={{
                          height: CELL_HEIGHT,
                          borderBottom: "1px solid #2a2a2a",
                          borderLeft: "1px solid #2a2a2a",
                        }} />
                      ))}
                      
                      {/* ⭐️ 이틀에 걸친 연속 일정을 오늘 표시 영역 안으로 정밀 슬라이싱 */}
                      {allCombinedBlocks.map((block, bi) => {
                        const st = new Date(block.realStart);
                        const ed = new Date(block.realEnd);

                        // 이번 날짜 범위에 아예 안 겹치면 패스
                        if (st >= dayEndBoundary || ed <= dayStartBoundary) return null;

                        // 경계선 자르기 연산
                        const currentDayStart = st < dayStartBoundary ? dayStartBoundary : st;
                        const currentDayEnd = ed > dayEndBoundary ? dayEndBoundary : ed;

                        const blockForRender = {
                          ...block,
                          computedStart: currentDayStart,
                          computedEnd: currentDayEnd
                        };

                        return (
                          <CalendarBlock key={bi} block={blockForRender} onClick={() => handleBlockClick(blockForRender)} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel" style={{
            width: 240, background: "#111111", borderLeft: "1px solid #2a2a2a",
            padding: "20px 12px", display: "flex", flexDirection: "column", gap: 20, flexShrink: 0,
          }}>
            <button onClick={handleLoadSchedule} style={{
              width: "100%", background: "#222222", color: "#fff",
              border: "1px solid #2a2a2a", borderRadius: 10,
              padding: "14px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>내 일정 불러오기</button>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#fff" }}>추천 일정</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {INIT_RECOMMENDED.map((r, i) => (
                  <div key={i} onClick={() => handleRecommendClick(r)} style={{
                    background: i === 0 ? "#3b6ef8" : "#1a1a1a", borderRadius: 12, padding: "14px 16px",
                    border: i === 0 ? "none" : "1px solid #2a2a2a", cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: i === 0 ? "#c0d4ff" : "#888" }}>{r.day}</span>
                      <span style={{ fontSize: 11, background: i === 0 ? "rgba(255,255,255,0.2)" : "#222222", color: i === 0 ? "#fff" : "#7090f8", borderRadius: 5, padding: "2px 8px", fontWeight: 600 }}>Best match</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: i === 0 ? "#fff" : "#ddd", marginBottom: 8 }}>{r.time}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: i === 0 ? "#c0d4ff" : "#888" }}>
                      <span>📍 {r.location}</span>
                      <span>👥 {r.count} 가능</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#fff" }}>장소 투표</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {places.sort((a, b) => b.votes - a.votes).map((p, i) => (
                  <div key={i} onClick={() => handleVotePlace(p.name)} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: myVote === p.name ? "#222222" : "#1a1a1a", borderRadius: 10, padding: "12px 16px",
                    border: myVote === p.name ? "1px solid #3b6ef8" : "1px solid #2a2a2a", fontSize: 14, color: "#ddd", cursor: "pointer",
                  }}>
                    <span>{p.name} {myVote === p.name ? "✓" : ""}</span>
                    <span style={{ background: "#222222", color: "#7090f8", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>{p.votes}표</span>
                  </div>
                ))}
                {showAddPlace ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <input value={newPlace} onChange={e => setNewPlace(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddPlace()} placeholder="장소 이름" autoFocus style={{ flex: 1, background: "#222222", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
                    <button onClick={handleAddPlace} style={{ background: "#3b6ef8", border: "none", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>추가</button>
                  </div>
                ) : (
                  <div onClick={() => setShowAddPlace(true)} style={{ fontSize: 13, color: "#555", padding: "4px 2px", cursor: "pointer" }}>+ 장소 추가하기</div>
                )}
              </div>
            </div>

            <button onClick={handleVote} style={{ width: "100%", background: "#3b6ef8", color: "#fff", border: "none", borderRadius: 10, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: "auto" }}>투표하기</button>
          </div>
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
          .right-panel { display: none !important; }
          .lang-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}