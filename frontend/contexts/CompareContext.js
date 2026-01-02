// contexts/CompareContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const MAX_COMPARE = 3;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading compare list:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("compareList", JSON.stringify(compareList));
    }
  }, [compareList, loading]);

  const addToCompare = (centerId) => {
    if (compareList.length >= MAX_COMPARE) {
      return { success: false, message: `You can only compare up to ${MAX_COMPARE} centers` };
    }
    if (!compareList.includes(centerId)) {
      setCompareList([...compareList, centerId]);
      return { success: true };
    }
    return { success: false, message: "Already in compare list" };
  };

  const removeFromCompare = (centerId) => {
    setCompareList(compareList.filter(id => id !== centerId));
  };

  const toggleCompare = (centerId) => {
    if (compareList.includes(centerId)) {
      removeFromCompare(centerId);
      return { success: true, action: "removed" };
    } else {
      return { ...addToCompare(centerId), action: "added" };
    }
  };

  const isInCompare = (centerId) => {
    return compareList.includes(centerId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const canAddMore = () => {
    return compareList.length < MAX_COMPARE;
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        canAddMore,
        compareCount: compareList.length,
        maxCompare: MAX_COMPARE,
        loading
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}