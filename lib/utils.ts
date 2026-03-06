import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, locale = 'en-US') {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function creditPercentage(used: number, total: number) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function creditStatus(remaining: number, total: number): 'high' | 'medium' | 'low' {
  const pct = (remaining / total) * 100;
  if (pct > 50) return 'high';
  if (pct > 20) return 'medium';
  return 'low';
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin:   'Super Admin',
  admin:         'Admin',
  company_admin: 'Company Admin',
  user:          'User',
  test_user:     'Test User',
  test_admin:    'Test Admin',
};

export function getRoleLabel(role: string) {
  return ROLE_LABELS[role] ?? role;
}
