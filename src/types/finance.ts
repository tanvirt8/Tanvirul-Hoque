export type TransactionType = 'income' | 'expense' | 'debt_given' | 'debt_taken' | 'transfer';

export type WalletId = 'cash' | 'bkash' | 'nagad' | 'bank' | 'rocket' | 'other';

export interface Wallet {
  id: WalletId;
  nameBn: string;
  nameEn: string;
  balance: number;
  iconName: string;
  color: string;
  accountNumber?: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  type: 'income' | 'expense';
  iconName: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string;
  walletId: WalletId;
  toWalletId?: WalletId; // For transfer
  contactPerson?: string; // For debt
  contactPhone?: string;
  dueDate?: string;
  isSettled?: boolean; // For debt
  settledDate?: string;
  note?: string;
  receiptNumber: string;
  createdAt: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export type AppLanguage = 'bn' | 'en';
export type NumberFormat = 'bn' | 'en';
