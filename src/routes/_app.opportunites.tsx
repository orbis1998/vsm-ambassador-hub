import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Sparkles } from "lucide-react";
export const Route = createFileRoute("/_app/opportunites")({
  component: () => <ComingSoon icon={Sparkles} title="Opportunités" subtitle="Castings, campagnes & événements" description="Toutes les opportunités exclusives proposées par VSM Collection." />,
});
