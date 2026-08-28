import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Administración",
  description: "Panel general de administración, verificación y control de Germina.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
