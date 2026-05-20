import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1) + 'M';
  }
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + 'K';
  }
  return points.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function calculateLevel(points: number): number {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function getLevelTitle(level: number): string {
  const titles = [
    'Beginner',
    'Learner',
    'Practitioner',
    'Expert',
    'Master',
    'Hero',
    'Legend',
  ];
  return titles[Math.min(level - 1, titles.length - 1)] || 'Eco Warrior';
}
