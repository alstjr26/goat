import { createContext, useContext, useState, useEffect } from "react";
import {
  apiCreateGroup, apiGetMyGroups, apiJoinGroup, apiDeleteGroup, apiGetSchedules,
} from "./api";

const PlanContext = createContext();

export function PlanProvider({ children }) {
  const [userBlocks, setUserBlocks] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [userEvents, setUserEvents] = useState([]);

  // 토큰 체크 추가
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  apiGetMyGroups().then(data => {
    if (Array.isArray(data)) setUserPlans(data);
  });
  
  apiGetSchedules().then(data => {
    if (Array.isArray(data)) {
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
          color: "#888888",
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
      return { success: true, id: result.group_plan_id };
    }
    return { success: false, message: result.message };
  };

  const invitePlanMember = async (groupId, email) => {
    return await apiJoinGroup(groupId, email);
  };

  // API 연동 추가
  const removePlan = async (id) => {
    console.log("삭제 시도 id:", id);
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