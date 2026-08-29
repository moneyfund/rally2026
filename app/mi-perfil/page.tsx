import type { Metadata } from "next";
import { AccountProfileGate } from "@/components/AccountProfileGate";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Administrá tu perfil, portada, ubicación, servicios y documentación privada en Germina.",
};

export default function MiPerfilPage() {
  return <AccountProfileGate />;
}
