// types/user.types.ts

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  
  // Account Status
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  loginAttempts: number;
  lockedUntil?: Date;
  
  // Roles & Permissions
  role: UserRole;
  permissions: Permission[];
  customPermissions?: string[];
  
  // Contact Information
  phoneNumber?: string;
  mobileNumber?: string;
  alternativeEmail?: string;
  address?: Address;
  
  // Professional Info
  manager?: string; // manager's userId
  teamId?: string;
  costCenter?: string;
  shiftTiming?: ShiftTiming;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  joinDate: Date;
  exitDate?: Date;
  
  // Preferences
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Security
  passwordHash: string;
  passwordLastChanged: Date;
  passwordExpiryDate?: Date;
  securityQuestions?: SecurityQuestion[];
  mfaMethod?: 'authenticator' | 'sms' | 'email';
  mfaSecret?: string;
  backupCodes?: string[];
  trustedDevices?: TrustedDevice[];
  sessionTimeout: number; // in minutes
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  deletedAt?: Date; // soft delete
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: Module;
  actions: Action[];
  conditions?: Condition[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // can't delete system roles
  priority: number; // for role hierarchy
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  desktopNotifications: boolean;
  notificationSound: boolean;
  dashboardLayout?: any;
  defaultView?: string;
  itemsPerPage: number;
  recentItems?: string[];
  favorites?: string[];
  bookmarks?: Bookmark[];
  shortcuts?: Shortcut[];
  filters?: SavedFilter[];
}