import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Award } from "lucide-react";
export const Route = createFileRoute("/_app/certificats")({
  component: () => <ComingSoon icon={Award} title="Certificats" subtitle="Vos certifications officielles" description="Téléchargez et partagez vos certificats VSM Academy." />,
});
