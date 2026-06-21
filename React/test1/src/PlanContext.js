import { createContext, useContext, useState, useEffect } from "react";
import {
  apiCreateGroup, apiGetMyGroups, apiJoinGroup, apiDeleteGroup, apiGetSchedules,
} from "./api";

const BLOCK_COLORS = ["#3b6ef8", "#34a853", "#fbbc04", "#ea4335", "#9c27b0", "#00bcd4", "#ff6d00", "#8bc34a"];

const PlanContext = createContext();

// 일정 id별 색상을 localStorage에 저장/복원 (MyCalendar.jsx와 동일한 키 사용)
function loadColorMap() {
  try {
    const saved = localStorage.getItem("schedule_colors");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// "2026. 06. 22 12:00 ~ 2026. 06. 22 14:00" 형식의 description을
// 정규식으로 직접 추출해서 파싱합니다.
function parseDateTimeChunk(str) {
  if (!str) return null;
  const dateMatch = str.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  const timeMatch = str.match(/(\d{1,2}):(\d{0,2})/);
  if (!dateMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const minute = timeMatch && timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day, hour, minute };
}

function planToBlock(plan) {
  if (!plan.description) return null;
  const parts = plan.description.split("~");
  if (parts.length < 1) return null;

  const start = parseDateTimeChunk(parts[0]);
  const end = parts.length > 1 ? parseDateTimeChunk(parts[1]) : null;
  if (!start) return null;

  const dateObj = new Date(start.year, start.month - 1, start.day);
  const dayOfWeek = dateObj.getDay();
  const di = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const isoDate = `${start.year}-${String(start.month).padStart(2,'0')}-${String(start.day).padStart(2,'0')}`;

  const startHour = start.hour;
  let endHour = end ? end.hour : start.hour + 1;
  if (endHour <= startHour) endHour = startHour + 1;
  if (endHour > 24) endHour = 24;

  return {
    planId: plan.group_plan_id,
    day: di,
    isoDate,
    startHour,
    endHour,
    type: "blue",
    title: plan.title,
    avatars: [],
    extra: 0,
    color: BLOCK_COLORS[Math.abs(plan.group_plan_id) % BLOCK_COLORS.length],
  };
}

export function PlanProvider({ children }) {
  const [userBlocks, setUserBlocks] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    apiGetMyGroups().then(data => {
      if (Array.isArray(data)) {
        setUserPlans(data);
        const blocks = data.map(planToBlock).filter(Boolean);
        setUserBlocks(blocks);
      }
    });

    apiGetSchedules().then(data => {
      if (Array.isArray(data)) {
        const colorMap = loadColorMap();
        setUserEvents(data.map(s => {
          const start = new Date(s.start_time);
          const end = new Date(s.end_time);
          return {
            id: s.schedule_id,
            isoDate: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`,
            date: start.toDateString(),
            weekDay: (start.getDay() + 6) % 7,
            startHour: start.getHours(),
            endHour: end.getHours(),
            title: s.title,
            color: colorMap[s.schedule_id] || BLOCK_COLORS[Math.abs(s.schedule_id) % BLOCK_COLORS.length],
          };
        }));
      }
    });
  }, []);

  const createPlan = async (title, description, deadline) => {
    const result = await apiCreateGroup(title, description, deadline);
    if (result.group_plan_id) {
      const newPlan = {
        group_plan_id: result.group_plan_id,
        title, description, deadline, status: 'OPEN'
      };
      setUserPlans(prev => [...prev, newPlan]);
      const block = planToBlock(newPlan);
      if (block) setUserBlocks(prev => [...prev, block]);
      return { success: true, id: result.group_plan_id };
    }
    return { success: false, message: result.message };
  };

  const invitePlanMember = async (groupId, email) => {
    return await apiJoinGroup(groupId, email);
  };

  const removePlan = async (id) => {
    try {
      await apiDeleteGroup(id);
    } catch (err) {
      return { success: false, message: "삭제 실패" };
    }
    setUserPlans(prev => prev.filter(p => p.group_plan_id !== id));
    setUserBlocks(prev => prev.filter(b => b.planId !== id));
    return { success: true };
  };

  const addBlock = (block) => setUserBlocks(prev => [...prev, block]);
  const removeBlock = (planId) => setUserBlocks(prev => prev.filter(b => b.planId !== planId));
  const addEvent = (event) => setUserEvents(prev => [...prev, event]);
  const removeEvent = (id) => setUserEvents(prev => prev.filter(e => e.id !== id));

  return (
    <PlanContext.Provider value={{
      userBlocks, addBlock, removeBlock,
      userPlans, createPlan, removePlan, invitePlanMember,
      userEvents, addEvent, removeEvent,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}