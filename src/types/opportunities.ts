import type { OpportunityApplicationStatus } from "@/types/messaging";

export interface VsmOpportunity {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  slots: number;
  applicants: number;
  conditions: string[];
  status: "open" | "soon" | "closed";
  reward: string;
  /** Statut de la candidature de l'utilisateur connecté */
  my_application?: OpportunityApplicationStatus | null;
  my_application_message?: string | null;
}

export type { Conversation, Message } from "@/types/messaging";
