import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formateTimeDelta = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const sec = Math.floor(seconds - hours * 3600 - minutes * 60);
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (sec > 0) {
    parts.push(`${sec}s`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
};
