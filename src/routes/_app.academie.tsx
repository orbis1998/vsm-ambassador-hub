import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_app/academie")({
  component: () => (
    <ComingSoon
      icon={GraduationCap}
      title="Académie"
      subtitle="Catalogue complet des formations VSM"
      description="Parcours certifiants, masterclasses et modules thématiques arrivent dans le prochain prompt."
    />
  ),
});
