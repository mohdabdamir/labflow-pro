// Local storage hooks for LIS data persistence

import { useState, useEffect, useCallback } from 'react';
import type { Case, Service, Profile, Client, Package, PriceList, NormalRange, Patient, User, CaseType, VATConfig } from '@/types/lab';
import { 
  mockCases, mockServices, mockProfiles, mockClients, 
  mockPackages, mockPriceLists, mockNormalRanges, mockUsers,
  mockCaseTypes, mockVATConfig
} from '@/data/mockData';

// Generic hook for localStorage with initial data
function useLocalStorage<T>(key: string, initialData: T[]): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialData;
    } catch {
      return initialData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, data]);

  return [data, setData];
}

// Cases Hook
export function useCases() {
  const [cases, setCases] = useLocalStorage<Case>('lis_cases', mockCases);

  const addCase = useCallback((newCase: Case) => {
    setCases(prev => [...prev, newCase]);
  }, [setCases]);

  const updateCase = useCallback((id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCases]);

  const deleteCase = useCallback((id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  }, [setCases]);

  const getCaseById = useCallback((id: string) => {
    return cases.find(c => c.id === id);
  }, [cases]);

  return { cases, addCase, updateCase, deleteCase, getCaseById, setCases };
}

// Services Hook
export function useServices() {
  const [services, setServices] = useLocalStorage<Service>('lis_services', mockServices);

  const addService = useCallback((service: Service) => {
    setServices(prev => [...prev, service]);
  }, [setServices]);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setServices]);

  const deleteService = useCallback((id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  }, [setServices]);

  const getServiceById = useCallback((id: string) => {
    return services.find(s => s.id === id);
  }, [services]);

  const getServicesByDepartment = useCallback((department: string) => {
    return services.filter(s => s.department === department);
  }, [services]);

  return { services, addService, updateService, deleteService, getServiceById, getServicesByDepartment, setServices };
}

// Profiles Hook
export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage<Profile>('lis_profiles', mockProfiles);

  const addProfile = useCallback((profile: Profile) => {
    setProfiles(prev => [...prev, profile]);
  }, [setProfiles]);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setProfiles]);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  }, [setProfiles]);

  return { profiles, addProfile, updateProfile, deleteProfile, setProfiles };
}

// Clients Hook
export function useClients() {
  const [clients, setClients] = useLocalStorage<Client>('lis_clients', mockClients);

  const addClient = useCallback((client: Client) => {
    setClients(prev => [...prev, client]);
  }, [setClients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setClients]);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, [setClients]);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  return { clients, addClient, updateClient, deleteClient, getClientById, setClients };
}

// Patients Hook
export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient>('lis_patients', [
    {
      id: 'PAT001', firstName: 'John', middleName: 'William', lastName: 'Anderson',
      name: 'John William Anderson', mrno: 'MR-10001', gender: 'Male',
      dob: '1979-05-15', age: 45, ageInputMode: 'dob',
      phone: '555-1234', email: 'john.anderson@email.com', createdAt: '2024-01-10',
    },
    {
      id: 'PAT002', firstName: 'Sarah', lastName: 'Mitchell',
      name: 'Sarah Mitchell', mrno: 'MR-10002', gender: 'Female',
      dob: '1992-08-22', age: 32, ageInputMode: 'dob',
      phone: '555-2345', email: 'sarah.m@email.com', createdAt: '2024-01-15',
    },
  ]);

  const addPatient = useCallback((patient: Patient) => {
    setPatients(prev => {
      const existing = prev.findIndex(p => p.id === patient.id);
      if (existing >= 0) {
        return prev.map((p, i) => i === existing ? { ...p, ...patient } : p);
      }
      return [...prev, patient];
    });
  }, [setPatients]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPatients]);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const getPatientByMrno = useCallback((mrno: string) => {
    return patients.find(p => p.mrno === mrno);
  }, [patients]);

  const searchPatients = useCallback((query: string) => {
    const q = query.toLowerCase();
    return patients.filter(p => 
      p.id.toLowerCase().includes(q) || 
      p.name.toLowerCase().includes(q) ||
      (p.mrno && p.mrno.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  }, [patients]);

  return { patients, addPatient, updatePatient, getPatientById, getPatientByMrno, searchPatients, setPatients };
}

// Packages Hook
export function usePackages() {
  const [packages, setPackages] = useLocalStorage<Package>('lis_packages', mockPackages);

  const addPackage = useCallback((pkg: Package) => {
    setPackages(prev => [...prev, pkg]);
  }, [setPackages]);

  const updatePackage = useCallback((id: string, updates: Partial<Package>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPackages]);

  const deletePackage = useCallback((id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  }, [setPackages]);

  return { packages, addPackage, updatePackage, deletePackage, setPackages };
}

// Price Lists Hook
export function usePriceLists() {
  const [priceLists, setPriceLists] = useLocalStorage<PriceList>('lis_pricelists', mockPriceLists);

  const addPriceList = useCallback((priceList: PriceList) => {
    setPriceLists(prev => [...prev, priceList]);
  }, [setPriceLists]);

  const updatePriceList = useCallback((id: string, updates: Partial<PriceList>) => {
    setPriceLists(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPriceLists]);

  const deletePriceList = useCallback((id: string) => {
    setPriceLists(prev => prev.filter(p => p.id !== id));
  }, [setPriceLists]);

  return { priceLists, addPriceList, updatePriceList, deletePriceList, setPriceLists };
}

// Normal Ranges Hook
export function useNormalRanges() {
  const [normalRanges, setNormalRanges] = useLocalStorage<NormalRange>('lis_normalranges', mockNormalRanges);

  const addNormalRange = useCallback((range: NormalRange) => {
    setNormalRanges(prev => [...prev, range]);
  }, [setNormalRanges]);

  const updateNormalRange = useCallback((id: string, updates: Partial<NormalRange>) => {
    setNormalRanges(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setNormalRanges]);

  const deleteNormalRange = useCallback((id: string) => {
    setNormalRanges(prev => prev.filter(r => r.id !== id));
  }, [setNormalRanges]);

  const getRangesForService = useCallback((serviceId: string) => {
    return normalRanges.filter(r => r.serviceId === serviceId);
  }, [normalRanges]);

  return { normalRanges, addNormalRange, updateNormalRange, deleteNormalRange, getRangesForService, setNormalRanges };
}

// Users Hook
export function useUsers() {
  const [users, setUsers] = useLocalStorage<User>('lis_users', mockUsers);

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, [setUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, [setUsers]);

  const getPathologists = useCallback(() => {
    return users.filter(u => (u.role === 'pathologist' || u.role === 'medical_director') && u.isActive);
  }, [users]);

  const getTechnicians = useCallback(() => {
    return users.filter(u => u.role === 'technician' && u.isActive);
  }, [users]);

  return { users, addUser, updateUser, getPathologists, getTechnicians, setUsers };
}

// Case Types Hook
export function useCaseTypes() {
  const [caseTypes, setCaseTypes] = useLocalStorage<CaseType>('lis_casetypes', mockCaseTypes);

  const addCaseType = useCallback((ct: CaseType) => {
    setCaseTypes(prev => [...prev, ct]);
  }, [setCaseTypes]);

  const updateCaseType = useCallback((id: string, updates: Partial<CaseType>) => {
    setCaseTypes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCaseTypes]);

  const deleteCaseType = useCallback((id: string) => {
    setCaseTypes(prev => prev.filter(c => c.id !== id));
  }, [setCaseTypes]);

  return { caseTypes, addCaseType, updateCaseType, deleteCaseType, setCaseTypes };
}

// VAT Config Hook
export function useVATConfig() {
  const [vatConfigs, setVATConfigs] = useLocalStorage<VATConfig>('lis_vatconfig', mockVATConfig);

  const getActiveVAT = useCallback(() => {
    const active = vatConfigs.find(v => v.isActive);
    return active?.percentage || 0;
  }, [vatConfigs]);

  const updateVAT = useCallback((percentage: number) => {
    setVATConfigs(prev => prev.map(v => ({ ...v, percentage })));
  }, [setVATConfigs]);

  return { vatConfigs, getActiveVAT, updateVAT, setVATConfigs };
}
