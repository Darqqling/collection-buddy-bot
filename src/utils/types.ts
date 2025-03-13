
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  telegramId: number;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  lastActive?: string;
  totalFundraisersCreated?: number;
  totalDonationsAmount?: number;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  creatorId: string;
  creatorUsername: string;
  status: FundraiserStatus;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  completedAt?: string;
  donationsCount?: number;
}

export interface Transaction {
  id: string;
  fundraiserId: string;
  fundraiserTitle?: string;
  donorId: string;
  donorUsername: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  notes?: string;
}

export interface TelegramWebhookConfig {
  url: string;
  isActive: boolean;
  lastChecked?: string;
  error?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminUsername: string;
  actionType: AdminActionType;
  targetType: 'user' | 'fundraiser' | 'transaction' | 'system';
  targetId?: string;
  details: string;
  createdAt: string;
}

export interface SystemStats {
  activeFundraisers: number;
  completedFundraisers: number;
  blockedFundraisers: number;
  totalUsers: number;
  totalRaised: number;
  recentTransactions: number;
}

export enum AdminActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CONFIRM_PAYMENT = 'confirm_payment',
  REJECT_PAYMENT = 'reject_payment'
}

export enum PaymentMethod {
  TELEGRAM_STARS = 'telegram_stars'
}

export enum FundraiserStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

// Additional types for UserDetails.tsx
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned'
}
