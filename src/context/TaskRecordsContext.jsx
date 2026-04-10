import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const TaskRecordsContext = createContext();

export const TaskRecordsProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const BASE_URL = "https://stacksapp-backend.onrender.com";

  // keep a ref to avoid stale closures and to track last fetched data
  const latestRecordsRef = useRef([]);
  const isFetchingRef = useRef(false);

  // Fetch records from backend and return parsed data
  const fetchTaskRecords = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    // Prevent concurrent identical fetches
    if (isFetchingRef.current) {
      return null;
    }
    isFetchingRef.current = true;

    try {
      const res = await fetch(`${BASE_URL}/api/task-records`, {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
      });

      // If non-OK response, still try to parse json to get error info
      const data = await res.json().catch(() => null);

      if (data && data.success && Array.isArray(data.records)) {
        // Avoid unnecessary setState if data didn't change (simple JSON compare)
        const prev = latestRecordsRef.current;
        const newJson = JSON.stringify(data.records);
        const prevJson = JSON.stringify(prev);
        if (newJson !== prevJson) {
          latestRecordsRef.current = data.records;
          setRecords(data.records);
        }
        isFetchingRef.current = false;
        return data.records;
      }

      // not successful -> return whatever parsed
      isFetchingRef.current = false;
      return data || null;
    } catch (err) {
      // network/error: swallow but allow caller to handle
      isFetchingRef.current = false;
      return null;
    }
  };

  // Expose a friendly alias that components already expect (refreshRecords)
  // Keep as an async function so consumers can await when needed.
  const refreshRecords = async () => {
    return fetchTaskRecords();
  };

  // Ensure we fetch records on provider mount if token already exists,
  // and also when authToken appears (login) — handle same-tab and cross-tab changes.
  useEffect(() => {
    let didFetch = false;
    let pollAttempts = 0;
    const MAX_POLL = 8; // stop after ~8 attempts (~6.4s at 800ms) to avoid continuous polling

    const tryFetchOnce = async () => {
      const token = localStorage.getItem("authToken");
      if (token && !didFetch) {
        didFetch = true;
        await fetchTaskRecords();
      }
    };

    // Immediate attempt
    tryFetchOnce();

    // Poll for token in same tab for a short period (in some login flows token is set after provider mount)
    const pollInterval = setInterval(() => {
      pollAttempts += 1;
      tryFetchOnce();
      if (pollAttempts >= MAX_POLL) {
        clearInterval(pollInterval);
      }
    }, 800);

    // Also listen for cross-tab changes to authToken (storage event)
    const onStorage = (e) => {
      if (e.key === "authToken" && e.newValue) {
        // token appeared in another tab -> fetch records now
        fetchTaskRecords();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on provider mount

  // NOTE: previous code also had an unconditional fetch in another effect — removed to avoid duplicate fetches.

  // Add a new task record (start task)
  const addTaskRecord = async (taskObj) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${BASE_URL}/api/start-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": token,
      },
      body: JSON.stringify({ image: taskObj.image }),
    });
    const data = await res.json();
    if (data.success) {
      // refresh in background but don't block caller
      fetchTaskRecords();
      if (data.isCombo) {
        return { isCombo: true, ...data };
      }
      return { task: data.task };
    }
    return null;
  };

  // Submit a task by taskCode ONLY!
  const submitTaskRecord = async (taskCode) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${BASE_URL}/api/submit-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": token,
      },
      body: JSON.stringify({ taskCode }),
    });
    const data = await res.json();
    if (data.success) {
      // refresh in background; keep non-blocking
      fetchTaskRecords();
      return data;
    }
    return { success: false, message: data.message, mustDeposit: !!data.mustDeposit };
  };

  // other helpers unchanged
  const hasPendingTask = () => records.some((t) => t.status === "Pending" && !t.isCombo);
  const hasPendingComboTask = () => records.some((t) => t.status === "Pending" && t.isCombo);
  const getPendingTask = () => records.find((t) => t.status === "Pending" && !t.isCombo) || null;
  const getPendingComboTasks = () => {
    const combo = records.find((t) => t.status === "Pending" && t.isCombo);
    if (!combo || !combo.comboGroupId) return [];
    return records.filter((t) => t.status === "Pending" && t.comboGroupId === combo.comboGroupId);
  };

  return (
    <TaskRecordsContext.Provider
      value={{
        records,
        setRecords,
        fetchTaskRecords,
        refreshRecords,
        addTaskRecord,
        submitTaskRecord,
        hasPendingTask,
        hasPendingComboTask,
        getPendingTask,
        getPendingComboTasks,
      }}
    >
      {children}
    </TaskRecordsContext.Provider>
  );
};

export const useTaskRecords = () => useContext(TaskRecordsContext);