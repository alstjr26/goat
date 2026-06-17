import { createContext, useContext, useState } from "react";

const PlanContext = createContext();

export function PlanProvider({ children }) {
  const [userBlocks, setUserBlocks] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [userEvents, setUserEvents] = useState([]);

  const addBlock = (block) => setUserBlocks(prev => [...prev, block]);
  const addPlan = (plan) => setUserPlans(prev => [...prev, plan]);

  const removePlan = (id) => {
    setUserPlans(prev => prev.filter(p => p.id !== id));
    setUserBlocks(prev => prev.filter(b => b.planId !== id));
  };

  const removeBlock = (planId) => {
    setUserBlocks(prev => prev.filter(b => b.planId !== planId));
  };

  const addEvent = (event) => setUserEvents(prev => [...prev, event]);
  const removeEvent = (id) => setUserEvents(prev => prev.filter(e => e.id !== id));

  return (
    <PlanContext.Provider value={{
      userBlocks, addBlock,
      userPlans, addPlan, removePlan, removeBlock,
      userEvents, addEvent, removeEvent,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}