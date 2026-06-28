import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/staff/login")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
