import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { usePlan } from "./PlanContext";
import {
  apiGetGroup, apiGetGroupMembers, apiJoinGroup,
  apiGetSchedules, apiPostAvailability,
  apiGetRecommend, apiConfirmGroup, apiGetConfirm,
} from "./api";

const cardStyle = {
  background: "#1a1a1a", borderRadius: 14, padding: "20px 24px",
  border: "1px solid #2a2a2a", marginBottom: 16,
};

const btnPrimary = {
  background: "#3b6ef8", color: "#fff", border: "none",
  borderRadius: 8, padding: "12px 20px", fontSize: 14,
  fontWeight: 700, cursor: "pointer",
};

const btnGhost = {
  background: "#222222", color: "#aaa", border: "1px solid #2a2a2a",
  borderRadius: 8, padding: "12px 20px", fontSize: 14, cursor: "pointer",
};

const inputStyle = {
  flex: 1, background: "#222222", border: "1px solid #2a2a2a",
  borderRadius: 8, padding: "11px 14px", fontSize: 14,
  color: "#fff", outline: "none", boxSizing: "border-box",
  fontFamily: "'Noto Sans KR', sans-serif",
};

function fmt(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { removePlan } = usePlan();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [recommend, setRecommend] = useState(null);
  const [confirmedMeeting, setConfirmedMeeting] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = group && user && group.user_id === user.id;
  console.log('user:',user, 'group.owner_id', group?.owner_id);

  const loadAll = async () => {
    setLoading(true);
    const g = await apiGetGroup(id);
    console.log("group 전체 데이터:", JSON.stringify(g));
    
    setGroup(g);

    const m = await apiGetGroupMembers(id);
    setMembers(Array.isArray(m) ? m : []);

    const s = await apiGetSchedules();
    setMySchedules(Array.isArray(s) ? s : []);

    if (g.status === "CONFIRMED") {
      const c = await apiGetConfirm(id);
      setConfirmedMeeting(c);
    } else {
      setConfirmedMeeting(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleSchedule = (sid) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(sid) ? next.delete(sid) : next.add(sid);
      return next;
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("이메일을 입력해주세요.");
      return;
    }
    setInviteLoading(true);
    const result = await apiJoinGroup(id, inviteEmail.trim());
    setInviteLoading(false);

    if (result.message === "멤버가 초대되었습니다.") {
      setInviteEmail("");
      setInviteError("");
      const m = await apiGetGroupMembers(id);
      setMembers(Array.isArray(m) ? m : []);
    } else {
      setInviteError(result.message || "초대에 실패했어요.");
    }
  };

  const handleSubmitAvailability = async () => {
    if (selectedIds.size === 0) {
      alert("제출할 일정을 선택해주세요.");
      return;
    }
    setSubmitting(true);
    for (const sid of selectedIds) {
      await apiPostAvailability(id, sid, true);
    }
    setSubmitting(false);
    alert("가능 시간이 제출되었습니다.");
  };

  const handleLoadRecommend = async () => {
    setRecommendLoading(true);
    const r = await apiGetRecommend(id);
    setRecommend(r);
    setRecommendLoading(false);
  };

  const handleConfirmSlot = async (slot) => {
    const result = await apiConfirmGroup(id, slot.start_time, slot.end_time);
    if (result.message === "약속이 확정되었습니다.") {
      await loadAll();
    } else {
      alert(result.message || "확정에 실패했어요.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("이 약속 방을 삭제하시겠어요?")) return;
    const result = await removePlan(id);
    if (result.success) {
      navigate("/history");
    } else {
      alert(result.message || "삭제에 실패했어요.");
    }
  };

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111111", color: "#888", fontFamily: "'Noto Sans KR', sans-serif",
      }}>불러오는 중...</div>
    );
  }

  if (!group) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111111", color: "#888", fontFamily: "'Noto Sans KR', sans-serif",
      }}>약속 방을 찾을 수 없어요.</div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#111111", color: "#fff",
      fontFamily: "'Noto Sans KR', sans-serif", padding: "0 0 60px",
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 24px", borderBottom: "1px solid #2a2a2a",
        background: "#111111",
      }}>
        <button onClick={() => navigate("/history")} style={{
          background: "none", border: "none", color: "#888",
          fontSize: 20, cursor: "pointer", padding: "0 4px",
        }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{group.title}</span>
        <span style={{
          marginLeft: 8, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: group.status === "CONFIRMED" ? "#1a3a2a" : "#2a2a1a",
          color: group.status === "CONFIRMED" ? "#4caf80" : "#f4a429",
        }}>{group.status === "CONFIRMED" ? "확정됨" : "투표 진행중"}</span>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 760, margin: "0 auto" }}>

        {/* 기본 정보 */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>설명</div>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 14 }}>{group.description || "-"}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>마감일</div>
          <div style={{ fontSize: 14, color: "#fff", marginBottom: 14 }}>{fmt(group.deadline)}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>방장</div>
          <div style={{ fontSize: 14, color: "#fff" }}>{group.users?.nickname || "-"}</div>
        </div>

        {/* 확정된 약속 */}
        {confirmedMeeting && (
          <div style={{ ...cardStyle, border: "1px solid #4caf80" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#4caf80", marginBottom: 10 }}>✓ 확정된 약속</div>
            <div style={{ fontSize: 15, color: "#fff" }}>
              {fmt(confirmedMeeting.start_time)} ~ {fmt(confirmedMeeting.end_time)}
            </div>
          </div>
        )}

        {/* 멤버 */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>멤버 ({members.length}명)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: isOwner ? 16 : 0 }}>
            {members.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#222222", borderRadius: 8, padding: "10px 14px",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", background: "#3b6ef8",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>👤</div>
                <div>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>
                    {m.users?.nickname}
                    {m.user_id === group.user_id && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, color: "#5b8af8",
                        background: "#1a2a4a", borderRadius: 20, padding: "2px 8px",
                      }}>방장</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>{m.users?.email}</div>
                </div>
              </div>
            ))}
          </div>

          {isOwner && group.status !== "CONFIRMED" && (
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setInviteError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                  placeholder="초대할 이메일을 입력하세요"
                  type="email"
                  style={{ ...inputStyle, border: inviteError ? "1px solid #e05555" : inputStyle.border }}
                />
                <button onClick={handleInvite} disabled={inviteLoading} style={btnPrimary}>
                  {inviteLoading ? "초대 중..." : "초대"}
                </button>
              </div>
              {inviteError && <p style={{ fontSize: 12, color: "#e05555", marginTop: 8 }}>{inviteError}</p>}
            </div>
          )}
        </div>

        {/* 가능 시간 제출 */}
        {group.status !== "CONFIRMED" && (
          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>내 가능 시간 제출</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
              내 시간표에서 이 모임에 제출할 시간을 선택하세요.
            </div>

            {mySchedules.length === 0 ? (
              <div style={{ fontSize: 13, color: "#666" }}>
                등록된 시간표가 없어요. <span onClick={() => navigate("/mycalendar")} style={{ color: "#3b6ef8", cursor: "pointer" }}>내 일정에서 추가하기</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {mySchedules.map(s => {
                  const sel = selectedIds.has(s.schedule_id);
                  return (
                    <div key={s.schedule_id} onClick={() => toggleSchedule(s.schedule_id)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: sel ? "#1a2a4a" : "#222222",
                      border: sel ? "1px solid #3b6ef8" : "1px solid #2a2a2a",
                      borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${sel ? "#3b6ef8" : "#555"}`,
                        background: sel ? "#3b6ef8" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "#fff",
                      }}>{sel ? "✓" : ""}</div>
                      <div>
                        <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{fmt(s.start_time)} ~ {fmt(s.end_time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {mySchedules.length > 0 && (
              <button onClick={handleSubmitAvailability} disabled={submitting} style={btnPrimary}>
                {submitting ? "제출 중..." : "선택한 시간 제출하기"}
              </button>
            )}
          </div>
        )}

        {/* 추천 시간 */}
        {group.status !== "CONFIRMED" && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>공통 가능 시간</div>
              <button onClick={handleLoadRecommend} disabled={recommendLoading} style={btnGhost}>
                {recommendLoading ? "불러오는 중..." : "새로고침"}
              </button>
            </div>

            {!recommend ? (
              <div style={{ fontSize: 13, color: "#666" }}>새로고침을 눌러 추천 시간을 확인하세요.</div>
            ) : recommend.recommended.length === 0 ? (
              <div style={{ fontSize: 13, color: "#666" }}>
                아직 모든 멤버({recommend.total_members}명)가 겹치는 시간이 없어요.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recommend.recommended.map((slot, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#222222", borderRadius: 8, padding: "12px 14px",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>
                        {fmt(slot.start_time)} ~ {fmt(slot.end_time)}
                      </div>
                      <div style={{ fontSize: 12, color: "#4caf80" }}>{slot.count}명 가능</div>
                    </div>
                    {isOwner && (
                      <button onClick={() => handleConfirmSlot(slot)} style={btnPrimary}>
                        이 시간으로 확정
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 위험 영역 */}
        {isOwner && (
          <div style={cardStyle}>
            <button onClick={handleDeleteGroup} style={{
              background: "none", border: "none", color: "#e05555",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>약속 방 삭제하기</button>
          </div>
        )}
      </div>
    </div>
  );
}