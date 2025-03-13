// Мок-данные для разработки и тестирования
import { 
  User, 
  Fundraiser, 
  Transaction, 
  FundraiserStatus, 
  TransactionStatus, 
  PaymentMethod,
  UserRole, 
  UserStatus 
} from './types';

// Вспомогательные функции для получения данных
export const fetchUserDetails = (userId: string): Promise<User> => {
  return Promise.resolve(mockUsers.find(user => user.id === userId) || mockUsers[0]);
};

export const fetchUserTransactions = (userId: string): Promise<Transaction[]> => {
  return Promise.resolve(mockTransactions.filter(tx => tx.senderId === userId || tx.receiverId === userId));
};

export const fetchUserFundraisers = (userId: string): Promise<Fundraiser[]> => {
  return Promise.resolve(mockFundraisers.filter(fr => fr.creatorId === userId));
};

// Мок-пользователи
export const mockUsers: User[] = [
  {
    id: "user1",
    telegramId: "12345678",
    username: "john_doe",
    firstName: "John",
    lastName: "Doe",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    joinedAt: "2023-04-15T10:30:00Z",
    lastActive: "2023-08-22T15:45:00Z",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "user2",
    telegramId: "87654321",
    username: "jane_smith",
    firstName: "Jane",
    lastName: "Smith",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    joinedAt: "2023-03-10T09:15:00Z",
    lastActive: "2023-08-21T11:20:00Z",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "admin1",
    telegramId: "98765432",
    username: "admin_user",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    joinedAt: "2023-01-05T08:00:00Z",
    lastActive: "2023-08-22T18:30:00Z",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  }
];

// Мок-кампании по сбору средств
export const mockFundraisers: Fundraiser[] = [
  {
    id: "fundraiser1",
    creatorId: "user1",
    title: "Help John raise money for education",
    description: "John needs your help to complete his education. Every dollar counts!",
    imageUrl: "https://via.placeholder.com/400x200",
    goalAmount: 5000,
    currentAmount: 2500,
    status: FundraiserStatus.ACTIVE,
    createdAt: "2023-07-01T14:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
  },
  {
    id: "fundraiser2",
    creatorId: "user2",
    title: "Support Jane's medical expenses",
    description: "Jane is battling a serious illness and needs financial support for her treatment.",
    imageUrl: "https://via.placeholder.com/400x200",
    goalAmount: 10000,
    currentAmount: 7500,
    status: FundraiserStatus.ACTIVE,
    createdAt: "2023-06-15T16:00:00Z",
    endDate: "2023-11-30T23:59:59Z",
  },
  {
    id: "fundraiser3",
    creatorId: "user1",
    title: "Emergency Relief for Earthquake Victims",
    description: "Donate to provide food, shelter, and medical assistance to those affected by the recent earthquake.",
    imageUrl: "https://via.placeholder.com/400x200",
    goalAmount: 20000,
    currentAmount: 15000,
    status: FundraiserStatus.COMPLETED,
    createdAt: "2023-05-20T10:00:00Z",
    endDate: "2023-10-31T23:59:59Z",
  }
];

// Мок-транзакции
export const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    senderId: "user1",
    receiverId: "fundraiser1",
    amount: 50,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: TransactionStatus.SUCCESSFUL,
    timestamp: "2023-08-22T10:00:00Z",
  },
  {
    id: "tx2",
    senderId: "user2",
    receiverId: "fundraiser2",
    amount: 100,
    paymentMethod: PaymentMethod.PAYPAL,
    status: TransactionStatus.SUCCESSFUL,
    timestamp: "2023-08-22T11:00:00Z",
  },
  {
    id: "tx3",
    senderId: "user1",
    receiverId: "fundraiser1",
    amount: 25,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: TransactionStatus.PENDING,
    timestamp: "2023-08-22T12:00:00Z",
  },
  {
    id: "tx4",
    senderId: "user2",
    receiverId: "fundraiser2",
    amount: 75,
    paymentMethod: PaymentMethod.PAYPAL,
    status: TransactionStatus.FAILED,
    timestamp: "2023-08-22T13:00:00Z",
  },
  {
    id: "tx5",
    senderId: "user1",
    receiverId: "fundraiser3",
    amount: 120,
    paymentMethod: PaymentMethod.BITCOIN,
    status: TransactionStatus.SUCCESSFUL,
    timestamp: "2023-08-23T14:00:00Z",
  }
];
