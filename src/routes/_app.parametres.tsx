import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Settings } from "lucide-react";
export const Route = createFileRoute("/_app/parametres")({
  component: () => <ComingSoon icon={Settings} title="Paramètres" subtitle="Personnalisez votre expérience" description="Préférences, notifications, sécurité et langue." />,
});
