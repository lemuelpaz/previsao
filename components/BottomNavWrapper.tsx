"use client";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function BottomNavWrapper() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/register")) return null;
  return <BottomNav />;
}
