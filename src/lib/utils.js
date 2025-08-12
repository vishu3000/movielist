import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toFiveScale(rating10) {
  const n = Number(rating10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n / 2));
}
