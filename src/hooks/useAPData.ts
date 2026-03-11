// AP module data hooks using localStorage
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageState<T>(key: string, initial: T[]): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }, [key, data]);
  return [data, setData];
}

import type { APCase, APBillingCode, APClientPrice } from '@/types/anatomicPathology';
import { mockAPCases, mockAPBillingCodes, mockAPClientPrices } from '@/data/apMockData';

export function useAPCases() {
  const [cases, setCases] = useLocalStorageState<APCase>('ap_cases', mockAPCases);

  const addCase = useCallback((c: APCase) => setCases(prev => [...prev, c]), [setCases]);
  const updateCase = useCallback((id: string, updates: Partial<APCase>) =>
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), [setCases]);
  const getCaseById = useCallback((id: string) => cases.find(c => c.id === id), [cases]);

  return { cases, addCase, updateCase, getCaseById, setCases };
}

export function useAPBillingCodes() {
  const [codes, setCodes] = useLocalStorageState<APBillingCode>('ap_billing_codes', mockAPBillingCodes);
  const [clientPrices, setClientPrices] = useLocalStorageState<APClientPrice>('ap_client_prices', mockAPClientPrices);

  const addCode = useCallback((c: APBillingCode) => setCodes(prev => [...prev, c]), [setCodes]);
  const updateCode = useCallback((id: string, u: Partial<APBillingCode>) =>
    setCodes(prev => prev.map(c => c.id === id ? { ...c, ...u } : c)), [setCodes]);
  const deleteCode = useCallback((id: string) =>
    setCodes(prev => prev.filter(c => c.id !== id)), [setCodes]);

  const addClientPrice = useCallback((p: APClientPrice) => setClientPrices(prev => [...prev, p]), [setClientPrices]);
  const updateClientPrice = useCallback((id: string, u: Partial<APClientPrice>) =>
    setClientPrices(prev => prev.map(p => p.id === id ? { ...p, ...u } : p)), [setClientPrices]);
  const deleteClientPrice = useCallback((id: string) =>
    setClientPrices(prev => prev.filter(p => p.id !== id)), [setClientPrices]);

  return { codes, addCode, updateCode, deleteCode, clientPrices, addClientPrice, updateClientPrice, deleteClientPrice };
}
