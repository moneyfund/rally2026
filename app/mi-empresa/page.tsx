import type { Metadata } from "next";
import { CompanyWorkspace } from "@/components/CompanyWorkspace";

export const metadata: Metadata = {
  title: "Mi empresa",
  description: "Panel empresarial de Germina para gestionar perfil, vacantes y postulaciones.",
};

export default function MiEmpresaPage() {
  return <CompanyWorkspace />;
}
