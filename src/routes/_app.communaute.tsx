import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Users } from "lucide-react";
export const Route = createFileRoute("/_app/communaute")({
  component: () => <ComingSoon icon={Users} title="Communauté" subtitle="Le hub social des ambassadeurs" description="Discussions, publications, mentors et entraide entre ambassadeurs VSM." />,
});
