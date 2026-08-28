import type { Metadata } from "next";
import { ProfileWorkspace } from "@/components/ProfileWorkspace";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Administrá tu perfil, servicios, ubicación y documentación privada en Germina.",
};

export default function MiPerfilPage() {
  return <ProfileWorkspace />;
}
