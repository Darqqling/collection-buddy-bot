
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
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  creatorId: string;
  creatorUsername: string;
  status: 'active' | 'completed' | 'blocked';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  fundraiserId: string;
  donorId: string;
  donorUsername: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  paymentMethod: 'telegram_stars';
  createdAt: string;
  confirmedAt?: string;
}

export interface TelegramWebhookConfig {
  url: string;
  isActive: boolean;
  lastChecked?: string;
  error?: string;
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
