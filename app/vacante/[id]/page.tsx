import type { Metadata } from "next";
import { JobDetail } from "@/components/JobDetail";

export const metadata: Metadata = {
  title: "Vacante",
  description: "Oportunidad laboral publicada por una empresa verificada en Germina.",
};

export default async function VacantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetail id={id} />;
}
