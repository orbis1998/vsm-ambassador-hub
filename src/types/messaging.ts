export type MessageType = "text" | "image" | "video" | "doc" | "voice" | "emoji";

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_at: string;
  unread: number;
  pinned?: boolean;
  is_group?: boolean;
  title?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  author_id: string;
  type: MessageType;
  body: string;
  created_at: string;
  read_by: string[];
  metadata?: Record<string, unknown>;
  story_id?: string | null;
  reply_to_id?: string | null;
  edited_at?: string | null;
  deleted_for_all?: boolean;
  deleted_for?: string[];
}

export type OpportunityApplicationStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: OpportunityApplicationStatus;
  message: string | null;
  created_at: string;
}

export interface AcademyCertificate {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  serial_number: string;
  qr_payload: string;
  pdf_url: string | null;
  issued_at: string;
  course_title?: string;
}
