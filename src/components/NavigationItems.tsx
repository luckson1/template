"use client";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";
import { getNavigationItems } from "@/config/sidebar";

export function useNavigationItems(session: Session | null) {
  const pathname = usePathname();
  return getNavigationItems(pathname, session);
}
