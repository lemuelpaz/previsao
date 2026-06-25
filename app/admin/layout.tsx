import AdminSidebar from "@/components/admin/AdminSidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
        {children}
      </div>
    </div>
  );
}
