import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a page title using the site configuration template
 * @param title The page-specific title
 * @returns Formatted title with site name
 */
export function formatPageTitle(title?: string): string {
  if (!title) return siteConfig.title.default;
  return siteConfig.title.template.replace("%s", title);
}
