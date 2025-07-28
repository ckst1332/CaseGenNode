import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Safe date parsing utility
export function safeDate(dateValue, fallback = 'N/A') {
  if (!dateValue || dateValue === null || dateValue === undefined) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    // Check if the date is valid
    if (isNaN(date.getTime()) || date.getTime() === 0) {
      console.warn('Invalid date value:', dateValue);
      return fallback;
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.warn('Date parsing error:', dateValue, error);
    return fallback;
  }
}

// Safe date parsing for relative time
export function safeDateRelative(dateValue, fallback = 'Never') {
  if (!dateValue) return fallback;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  } catch (error) {
    console.warn('Invalid date value for relative time:', dateValue, error);
    return fallback;
  }
}

// Check if a date string is valid
export function isValidDate(dateValue) {
  if (!dateValue) return false;
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
