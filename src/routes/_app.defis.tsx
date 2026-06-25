import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Trophy } from "lucide-react";
export const Route = createFileRoute("/_app/defis")({
  component: () => <ComingSoon icon={Trophy} title="Défis" subtitle="Relevez les défis, gagnez de l'XP" description="Défis quotidiens, hebdomadaires et saisonniers pour faire grimper votre rang." />,
});
