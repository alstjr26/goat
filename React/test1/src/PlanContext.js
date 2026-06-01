import { createContext, useContext, useState, useEffect } from "react";

const PlanContext = createContext();

export function PlanProvider({ children }) {
  // 1. 앱이 켜질 때(또는 새로고침 시) 로컬 스토리지에서 기존 데이터를 불러옵니다.
  const [userBlocks, setUserBlocks] = useState(() => {
    const savedBlocks = localStorage.getItem("userBlocks");
    return savedBlocks ? JSON.parse(savedBlocks) : [];
  });

  const [userPlans, setUserPlans] = useState(() => {
    const savedPlans = localStorage.getItem("userPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });

  // 2. 데이터가 변경될 때마다(추가/삭제) 로컬 스토리지에 덮어씌워 저장합니다.
  useEffect(() => {
    localStorage.setItem("userBlocks", JSON.stringify(userBlocks));
  }, [userBlocks]);

  useEffect(() => {
    localStorage.setItem("userPlans", JSON.stringify(userPlans));
  }, [userPlans]);

  // 기존 로직은 그대로 유지합니다.
  const addBlock = (block) => {
    setUserBlocks(prev => [...prev, block]);
  };

  const addPlan = (plan) => {
    setUserPlans(prev => [...prev, plan]);
  };

  const removePlan = (id) => {
    setUserPlans(prev => prev.filter(p => p.id !== id));
    setUserBlocks(prev => prev.filter(b => b.planId !== id));
  };

  const removeBlock = (planId) => {
    setUserBlocks(prev => prev.filter(b => b.planId !== planId));
  };

  return (
    <PlanContext.Provider value={{ userBlocks, addBlock, userPlans, addPlan, removePlan, removeBlock }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}