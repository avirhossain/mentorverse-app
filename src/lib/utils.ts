import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT', // Changed to BDT as per user request context
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}