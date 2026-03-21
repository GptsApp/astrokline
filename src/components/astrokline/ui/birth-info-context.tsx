'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'astrokline_birth_data';
const KLINE_RESULT_KEY = 'astrokline_kline_result';

function saveJsonToStorage(key: string, value: unknown) {
  const serialized = JSON.stringify(value);

  try {
    localStorage.setItem(key, serialized);
  } catch {
    /* ignore localStorage errors */
  }

  try {
    sessionStorage.setItem(key, serialized);
  } catch {
    /* ignore sessionStorage errors */
  }
}

function readJsonFromStorage<T>(key: string): T | null {
  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      /* ignore parse/storage errors */
    }
  }

  return null;
}

export function getSavedBirthData(): BirthData | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = readJsonFromStorage<BirthData>(STORAGE_KEY);
    if (!parsed) return null;
    // Validate it has the required fields
    if (
      parsed.name &&
      parsed.date &&
      parsed.location &&
      parsed.lat !== null &&
      parsed.lon !== null
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveBirthData(data: BirthData) {
  try {
    saveJsonToStorage(STORAGE_KEY, data);
  } catch {
    /* ignore quota errors */
  }
}

export function saveKlineResult(result: any) {
  try {
    saveJsonToStorage(KLINE_RESULT_KEY, result);
  } catch {
    /* ignore quota errors */
  }
}

export function getSavedKlineResult(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    return readJsonFromStorage(KLINE_RESULT_KEY);
  } catch {
    return null;
  }
}

export function clearSavedKlineResult() {
  try {
    localStorage.removeItem(KLINE_RESULT_KEY);
  } catch {}

  try {
    sessionStorage.removeItem(KLINE_RESULT_KEY);
  } catch {}
}

export interface BirthData {
  name: string;
  gender: 'male' | 'female' | 'non-binary' | '';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "14:00-15:00" or "unknown"
  location: string; // display name
  lat: number | null;
  lon: number | null;
}

const DEFAULT_BIRTH_DATA: BirthData = {
  name: '',
  gender: '',
  date: '',
  timeSlot: '',
  location: '',
  lat: null,
  lon: null,
};

interface BirthInfoContextType {
  data: BirthData;
  setData: React.Dispatch<React.SetStateAction<BirthData>>;
  isComplete: boolean;
  isModalOpen: boolean;
  openModal: (onComplete?: (data: BirthData) => void) => void;
  closeModal: () => void;
  onCompleteCallback: ((data: BirthData) => void) | null;
}

const BirthInfoContext = createContext<BirthInfoContextType | null>(null);

export function BirthInfoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BirthData>(DEFAULT_BIRTH_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onCompleteCallback, setOnCompleteCallback] = useState<
    ((data: BirthData) => void) | null
  >(null);

  const isComplete = !!(
    data.name &&
    data.gender &&
    data.date &&
    data.timeSlot &&
    data.location
  );

  const openModal = useCallback((onComplete?: (data: BirthData) => void) => {
    // Reset all data on each open to prevent stale values
    setData({ ...DEFAULT_BIRTH_DATA });
    if (onComplete) {
      setOnCompleteCallback(() => onComplete);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Persist completed data to localStorage
    if (data.name && data.date && data.location) {
      saveBirthData(data);
    }
  }, [data]);

  return (
    <BirthInfoContext.Provider
      value={{
        data,
        setData,
        isComplete,
        isModalOpen,
        openModal,
        closeModal,
        onCompleteCallback,
      }}
    >
      {children}
    </BirthInfoContext.Provider>
  );
}

export function useBirthInfo() {
  const ctx = useContext(BirthInfoContext);
  if (!ctx)
    throw new Error('useBirthInfo must be used within BirthInfoProvider');
  return { data: ctx.data, isComplete: ctx.isComplete };
}

export function useBirthInfoModal() {
  const ctx = useContext(BirthInfoContext);
  if (!ctx)
    throw new Error('useBirthInfoModal must be used within BirthInfoProvider');
  return {
    open: ctx.openModal,
    close: ctx.closeModal,
    isOpen: ctx.isModalOpen,
    data: ctx.data,
    setData: ctx.setData,
    isComplete: ctx.isComplete,
    onCompleteCallback: ctx.onCompleteCallback,
  };
}
