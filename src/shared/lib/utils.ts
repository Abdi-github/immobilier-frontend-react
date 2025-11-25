import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// merge tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
