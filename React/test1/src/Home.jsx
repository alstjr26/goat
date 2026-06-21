import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";

const DAYS_OF_WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = [
  "12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM",
  "12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"
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
const CELL_HEIGHT = 60;

function CalendarBlock({ block, onClick }) {
  const top = block.startHour * CELL_HEIGHT;
  const height = (block.endHour - block.startHour) * CELL_HEIGHT;
  const isBlue = block.type === "blue";
  const color = block.color || "#3b6ef8";

  return (
    <div onClick={onClick} style={{
      position: "absolute",
      top: top + 2, left: 2, right: 2,
      height: height - 4,
      background: `${color}33`,
      border: `1px solid ${color}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 4,
      padding: "4px 6px",
      fontSize: 11, fontWeight: 600,
      display: "flex", flexDirection: "column",
      justifyContent: "flex-start", gap: 4,
      overflow: "hidden",
      cursor: "pointer", transition: "filter 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.3)"}
      onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
    >
      {isBlue && block.avatars && block.avatars.length > 0 && (
        <AvatarGroup avatars={block.avatars} extra={block.extra} size={20} />
      )}
      {block.title && (
        <div style={{ color: color, fontSize: 11, fontWeight: 600 }}>
          {block.title}
        </div>
      )}
      <div style={{ fontSize: 10, color: "#aaa" }}>
        {HOURS[block.startHour]} - {HOURS[block.endHour]}
      </div>
    </div>
  );
}

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
  const { userBlocks, removeBlock, userEvents, userPlans } = usePlan();
  const navigate = useNavigate();
  const [view, setView] = useState("전체 결과 보기");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [modal, setModal] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [initBlocks, setInitBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem("home_loaded_blocks");
      return saved ? JSON.parse(saved) : INIT_BLOCKS;
    } catch {
      return INIT_BLOCKS;
    }
  });

  useEffect(() => {
    localStorage.setItem("home_loaded_blocks", JSON.stringify(initBlocks));
  }, [initBlocks]);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
  const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + i);
  return `${DAYS_OF_WEEK_KO[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`;
});

const DAYS_ISO = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
});
  const month = startOfWeek.getMonth() + 1;
  const weekNum = Math.ceil(startOfWeek.getDate() / 7);

  const closeModal = () => setModal(null);

  const handleLoadSchedule = () => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekEvents = userEvents.filter(ev => {
      const evDate = new Date(ev.isoDate + "T00:00:00");
      evDate.setHours(0, 0, 0, 0);
      return evDate >= weekStart && evDate <= weekEnd;
    });

    const ScheduleModal = () => {
      const [sel, setSel] = React.useState(new Set());

      const toggle = (id) => {
        setSel(prev => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
      };

      const handleConfirm = () => {
  const chosenEvents = weekEvents.filter(ev => sel.has(ev.id));
  setInitBlocks(prev => {
    const filtered = prev.filter(b => !b.fromMyCalendar);
    const newBlocks = chosenEvents.map(ev => ({
      day: ev.weekDay,
      isoDate: ev.isoDate,
      startHour: ev.startHour,
      endHour: ev.endHour,
      type: "gray-light",
      title: ev.title,
      color: ev.color,
      fromMyCalendar: true,
    }));
    return [...filtered, ...newBlocks];
  });
  closeModal();
};

      return (
        <div>
          {weekEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p style={{ color: "#aaa", fontSize: 14 }}>이번 주 내 일정이 없어요.</p>
              <p style={{ color: "#666", fontSize: 12, marginTop: 8 }}>내 일정 탭에서 일정을 추가해보세요!</p>
            </div>
          ) : (
            <div>
              <p style={{ color: "#aaa", fontSize: 13, marginBottom: 14 }}>
                표시할 일정을 선택하세요 ({sel.size}/{weekEvents.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {weekEvents.map(ev => {
                  const isSelected = sel.has(ev.id);
                  return (
                    <div key={ev.id} onClick={() => toggle(ev.id)} style={{
                      background: isSelected ? `${ev.color}22` : "#222222",
                      borderRadius: 8, padding: "10px 14px",
                      border: isSelected ? `1px solid ${ev.color}` : "1px solid #2a2a2a",
                      borderLeft: `3px solid ${ev.color}`,
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${isSelected ? ev.color : "#555"}`,
                        background: isSelected ? ev.color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "#fff",
                      }}>{isSelected ? "✓" : ""}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          📅 {ev.date} &nbsp; 🕐 {ev.startHour}시 ~ {ev.endHour}시
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={closeModal} style={{
              flex: 1, background: "#222222", border: "1px solid #2a2a2a",
              color: "#aaa", borderRadius: 8, padding: "12px 0",
              fontSize: 14, cursor: "pointer"
            }}>취소</button>
            {weekEvents.length > 0 && (
              <button onClick={handleConfirm} style={{
                flex: 1, background: "#3b6ef8", border: "none",
                color: "#fff", borderRadius: 8, padding: "12px 0",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>홈에 표시</button>
            )}
          </div>
        </div>
      );
    };

    setModal({
      type: "schedule",
      content: <ScheduleModal />,
    });
  };

  const handleBlockClick = (block) => {
    const plan = userPlans.find(p => p.id === block.planId);
    setModal({
      type: "block",
      block: block,
      content: (
        <div>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>📅 {DAYS[block.day]}</p>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            {HOURS[block.startHour]} ~ {HOURS[block.endHour]}
          </p>
          {block.title && (
            <p style={{ color: "#fff", fontSize: 14, marginBottom: 12 }}>📋 {block.title}</p>
          )}
          {plan && plan.participants && plan.participants.length > 0 && (
            <div>
              <p style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>👥 참여 멤버</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {plan.participants.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#222222", borderRadius: 8, padding: "8px 12px",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "#3b6ef8", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>👤</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: p.voted ? "#4caf80" : "#888" }}>
                        {p.voted ? "✓ 투표 완료" : "미투표"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

  const openSettings = () => navigate("/settings");
  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "참여 기록") { navigate("/history"); return; }
    if (label === "새 모임") { navigate("/newplan"); return; }
    if (label === "내 일정") { navigate("/mycalendar"); return; }
    if (label === "마이페이지") { navigate("/mypage"); return; }
  };

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
                  setInitBlocks(prev => prev.filter(b =>
                    !(b.day === deleteConfirm.day &&
                      b.startHour === deleteConfirm.startHour &&
                      b.endHour === deleteConfirm.endHour)
                  ));
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
          modal.type === "block" ? "일정 상세" : ""
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

      {/* 가운데 + 오른쪽 전체 스크롤 영역 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
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
        </div>

        {/* Sub toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", borderBottom: "1px solid #2a2a2a",
          background: "#111111", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["내 일정 보기", "전체 결과 보기"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "none",
                background: view === v ? "#3b6ef8" : "#222222",
                color: view === v ? "#fff" : "#aaa",
                transition: "background 0.15s",
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* 캘린더 + 오른쪽 패널 */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Calendar - MyCalendar와 동일 구조 (0~23시, 24칸, 스크롤 가능) */}
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
            <div style={{
              display: "flex", position: "sticky", top: 0,
              background: "#111111", zIndex: 5, borderBottom: "1px solid #2a2a2a",
            }}>
              <div style={{ width: 80, flexShrink: 0 }} />
              {DAYS.map((day, di) => (
                <div key={di} style={{
                  flex: 1, height: 48, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, color: "#aaa",
                  fontWeight: 500, borderLeft: "1px solid #2a2a2a",
                }}>{day}</div>
              ))}
            </div>

            <div style={{ display: "flex" }}>
              <div style={{ width: 80, flexShrink: 0 }}>
                {HOURS.map((h, i) => (
                  <div key={i} style={{
                    height: CELL_HEIGHT, display: "flex", alignItems: "flex-start",
                    justifyContent: "flex-end", paddingRight: 10, paddingTop: 4,
                    color: "#555", fontSize: 11,
                  }}>{h}</div>
                ))}
              </div>

              {DAYS.map((day, di) => (
                <div key={di} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ position: "relative" }}>
                    {HOURS.map((_, hi) => (
                      <div key={hi} style={{
                        height: CELL_HEIGHT,
                        borderBottom: "1px solid #1e1e1e",
                        borderLeft: "1px solid #2a2a2a",
                      }} />
                    ))}
                    {[...initBlocks, ...userBlocks].filter(b =>
  b.isoDate ? b.isoDate === DAYS_ISO[di] : b.day === di
).map((block, bi) => (
  <CalendarBlock key={bi} block={block} onClick={() => handleBlockClick(block)} />
))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel" style={{
            width: 240, background: "#111111",
            borderLeft: "1px solid #2a2a2a",
            padding: "20px 12px", display: "flex",
            flexDirection: "column", gap: 20,
            flexShrink: 0,
          }}>
            <button onClick={handleLoadSchedule} style={{
              width: "100%", background: "#222222", color: "#fff",
              border: "1px solid #2a2a2a", borderRadius: 10,
              padding: "14px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
              onMouseLeave={e => e.currentTarget.style.background = "#222222"}
            >내 일정 불러오기</button>
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
          .right-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}