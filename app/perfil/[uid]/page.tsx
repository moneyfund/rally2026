import type { Metadata } from "next";
import { PublicProfile } from "@/components/PublicProfile";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Perfil público de talento o emprendimiento en Germina.",
};

export default async function PerfilPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <PublicProfile uid={uid} />;
}
