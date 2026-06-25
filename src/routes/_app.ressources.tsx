import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { BookOpen } from "lucide-react";
export const Route = createFileRoute("/_app/ressources")({
  component: () => <ComingSoon icon={BookOpen} title="Ressources" subtitle="Kits, médias & guides officiels" description="Logos, lookbooks, templates et toutes les ressources de marque." />,
});
