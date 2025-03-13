
import { 
  User, 
  Fundraiser, 
  Transaction, 
  AdminAction, 
  AdminActionType,
  FundraiserStatus,
  PaymentMethod,
  TransactionStatus,
  UserRole,
  UserStatus
} from './types';

// Users mock data
export const users: User[] = [
  {
    id: '1',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    telegramId: 12345678,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-09-01T10:00:00Z',
    lastActive: '2023-11-28T15:45:00Z',
    totalFundraisersCreated: 5,
    totalDonationsAmount: 850
  },
  {
    id: '2',
    username: 'jane_smith',
    firstName: 'Jane',
    lastName: 'Smith',
    telegramId: 87654321,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-09-15T14:30:00Z',
    lastActive: '2023-11-27T09:20:00Z',
    totalFundraisersCreated: 3,
    totalDonationsAmount: 450
  },
  {
    id: '3',
    username: 'admin_user',
    firstName: 'Admin',
    telegramId: 11223344,
    isAdmin: true,
    isBanned: false,
    createdAt: '2023-08-01T09:00:00Z',
    lastActive: '2023-11-29T10:15:00Z',
    totalFundraisersCreated: 0,
    totalDonationsAmount: 0
  },
  {
    id: '4',
    username: 'mary_jones',
    firstName: 'Mary',
    lastName: 'Jones',
    telegramId: 44556677,
    isAdmin: false,
    isBanned: true,
    createdAt: '2023-10-01T11:20:00Z',
    lastActive: '2023-10-15T16:40:00Z',
    totalFundraisersCreated: 1,
    totalDonationsAmount: 150
  }
];

// Fundraisers mock data
export const fundraisers: Fundraiser[] = [
  {
    id: '1',
    title: 'Birthday Gift for Alice',
    description: 'Collecting funds for a surprise birthday gift for our colleague Alice.',
    goal: 300,
    raised: 250,
    creatorId: '1',
    creatorUsername: 'john_doe',
    status: FundraiserStatus.ACTIVE,
    createdAt: '2023-11-01T10:30:00Z',
    updatedAt: '2023-11-28T14:20:00Z',
    donationsCount: 5
  },
  {
    id: '2',
    title: 'Team Building Event',
    description: 'Let\'s collect funds for our annual team building event.',
    goal: 1000,
    raised: 1000,
    creatorId: '2',
    creatorUsername: 'jane_smith',
    status: FundraiserStatus.COMPLETED,
    createdAt: '2023-10-10T09:15:00Z',
    updatedAt: '2023-11-20T16:45:00Z',
    completedAt: '2023-11-20T16:45:00Z',
    donationsCount: 15
  },
  {
    id: '3',
    title: 'New Year Office Party',
    description: 'Collecting funds for our office New Year celebration.',
    goal: 800,
    raised: 450,
    creatorId: '1',
    creatorUsername: 'john_doe',
    status: FundraiserStatus.ACTIVE,
    createdAt: '2023-11-15T11:20:00Z',
    updatedAt: '2023-11-29T13:10:00Z',
    donationsCount: 7
  }
];

// Transactions mock data
export const transactions: Transaction[] = [
  {
    id: '1',
    fundraiserId: '1',
    fundraiserTitle: 'Birthday Gift for Alice',
    donorId: '2',
    donorUsername: 'jane_smith',
    amount: 50,
    currency: 'USD',
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    status: TransactionStatus.CONFIRMED,
    createdAt: '2023-11-10T10:45:00Z',
    confirmedAt: '2023-11-10T10:55:00Z'
  },
  {
    id: '2',
    fundraiserId: '1',
    fundraiserTitle: 'Birthday Gift for Alice',
    donorId: '3',
    donorUsername: 'admin_user',
    amount: 75,
    currency: 'USD',
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    status: TransactionStatus.CONFIRMED,
    createdAt: '2023-11-12T14:30:00Z',
    confirmedAt: '2023-11-12T14:40:00Z'
  },
  {
    id: '3',
    fundraiserId: '2',
    fundraiserTitle: 'Team Building Event',
    donorId: '1',
    donorUsername: 'john_doe',
    amount: 100,
    currency: 'USD',
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    status: TransactionStatus.CONFIRMED,
    createdAt: '2023-11-01T09:20:00Z',
    confirmedAt: '2023-11-01T09:30:00Z'
  },
  {
    id: '4',
    fundraiserId: '3',
    fundraiserTitle: 'New Year Office Party',
    donorId: '2',
    donorUsername: 'jane_smith',
    amount: 200,
    currency: 'USD',
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    status: TransactionStatus.PENDING,
    createdAt: '2023-11-28T16:15:00Z'
  },
  {
    id: '5',
    fundraiserId: '3',
    fundraiserTitle: 'New Year Office Party',
    donorId: '1',
    donorUsername: 'john_doe',
    amount: 250,
    currency: 'USD',
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    status: TransactionStatus.CONFIRMED,
    createdAt: '2023-11-25T11:10:00Z',
    confirmedAt: '2023-11-25T11:30:00Z'
  }
];

// Admin actions mock data
export const adminActions: AdminAction[] = [
  {
    id: '1',
    adminId: '3',
    adminUsername: 'admin_user',
    actionType: AdminActionType.BLOCK,
    targetType: 'user',
    targetId: '4',
    details: 'Blocked user for violating community guidelines',
    createdAt: '2023-10-15T15:30:00Z'
  },
  {
    id: '2',
    adminId: '3',
    adminUsername: 'admin_user',
    actionType: AdminActionType.CONFIRM_PAYMENT,
    targetType: 'transaction',
    targetId: '3',
    details: 'Manually confirmed payment for Team Building Event',
    createdAt: '2023-11-01T09:30:00Z'
  },
  {
    id: '3',
    adminId: '3',
    adminUsername: 'admin_user',
    actionType: AdminActionType.LOGIN,
    targetType: 'system',
    details: 'Admin login',
    createdAt: '2023-11-29T10:15:00Z'
  }
];
