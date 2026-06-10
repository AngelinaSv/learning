import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(value?: string | Date) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
