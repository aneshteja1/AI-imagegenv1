// ============================================================
// VENKATTECH FACE SWAP SAAS — SHARED TYPES
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'company_admin' | 'user' | 'test_user' | 'test_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  credits: number;
  creditLimit: number;
  avatar?: string;
  isTest?: boolean;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  language: 'en' | 'ge';
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  credits: number;
  creditLimit: number;
  plan: SubscriptionPlan;
  adminId: string;
  userCount: number;
  files: CompanyFile[];
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CompanyFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
}

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceYearly: number;
  credits: number;
  features: string[];
  maxUsers: number;
  maxStorage: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  companyId?: string;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  description: string;
  operation?: OperationType;
  createdAt: string;
}

export type OperationType =
  | 'face_swap'
  | 'image_generation'
  | 'video_generation'
  | 'avatar_generation'
  | 'bulk_generation'
  | 'virtual_reshoot'
  | 'purchase';

export const CREDIT_COSTS: Record<OperationType, number> = {
  face_swap: 2,
  image_generation: 1,
  video_generation: 5,
  avatar_generation: 3,
  bulk_generation: 1, // per image
  virtual_reshoot: 3,
  purchase: 0,
};

export interface Job {
  id: string;
  userId: string;
  companyId?: string;
  type: OperationType;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  input?: Record<string, unknown>;
  output?: JobOutput;
  error?: string;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
}

export interface JobOutput {
  images?: string[];
  videos?: string[];
  analysisText?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  credits: number;
  userId: string;
  companyId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSwaps: number;
  creditsUsed: number;
  creditsRemaining: number;
  activeJobs: number;
  successRate: number;
  todaySwaps: number;
  weeklySwaps: number[];
  recentJobs: Job[];
}

export interface AdminStats extends DashboardStats {
  totalCompanies: number;
  totalUsers: number;
  pendingApprovals: number;
  revenue: number;
  companiesByPlan: Record<SubscriptionPlan, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
