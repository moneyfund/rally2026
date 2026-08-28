import type { Metadata } from "next";
import { ProfileWorkspaceV2 } from "@/components/ProfileWorkspaceV2";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Administrá tu perfil, portada, ubicación, servicios y documentación privada en Germina.",
};

export default function MiPerfilPage() {
  return <ProfileWorkspaceV2 />;
}
