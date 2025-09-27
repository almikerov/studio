import { useState, useCallback } from 'react';

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const useHistory = <T>(initialState?: T): [
  T | undefined, 
  (newState: T, overwrite?: boolean) => void, 
  () => void, 
  () => void, 
  boolean, 
  boolean
] => {
  const [history, setHistory] = useState<HistoryState<T> | undefined>(
    initialState ? { past: [], present: initialState, future: [] } : undefined
  );

  const canUndo = !!history && history.past.length > 0;
  const canRedo = !!history && history.future.length > 0;

  const setState = useCallback((newState: T, overwrite = false) => {
    setHistory(currentHistory => {
      if (overwrite) {
        return { past: [], present: newState, future: [] };
      }
      
      if (!currentHistory) {
         return { past: [], present: newState, future: [] };
      }

      // If the new state is the same as the present, do nothing
      if (JSON.stringify(newState) === JSON.stringify(currentHistory.present)) {
        return currentHistory;
      }

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newState,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.past.length === 0) {
        return currentHistory;
      }
      const newPresent = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
      return {
        past: newPast,
        present: newPresent,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.future.length === 0) {
        return currentHistory;
      }
      const newPresent = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  return [history?.present, setState, undo, redo, canUndo, canRedo];
};
