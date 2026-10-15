export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: number;
  approvedAt?: number;
  lastLoginAt?: number;
  transactionCount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isPendingApproval: boolean;
  error: string | null;
}
