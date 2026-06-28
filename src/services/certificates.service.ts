// @ts-nocheck
import { getSupabase } from "@/lib/supabase/client";
import type { CertificateRecord } from "@/types/academy";
import type { AcademyCertificate } from "@/types/messaging";

function certificatesDb() {
  return getSupabase();
}

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

export async function fetchUserCertificates(userId: string): Promise<AcademyCertificate[]> {
  const db = certificatesDb();
  const { data, error } = await db
    .from("academy_certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const courseIds = rows
    .map((r) => r.course_id as string | null)
    .filter((id): id is string => Boolean(id));

  let courseTitles = new Map<string, string>();
  if (courseIds.length) {
    const { data: courses } = await db
      .from("academy_courses")
      .select("id, title")
      .in("id", courseIds);
    for (const c of courses ?? []) {
      courseTitles.set(String((c as { id: string }).id), String((c as { title: string }).title));
    }
  }

  return rows.map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    course_id: row.course_id ? String(row.course_id) : null,
    title: String(row.title),
    serial_number: String(row.serial_number),
    qr_payload: String(row.qr_payload),
    pdf_url: row.pdf_url ? String(row.pdf_url) : null,
    issued_at: String(row.issued_at),
    course_title: row.course_id ? courseTitles.get(String(row.course_id)) : undefined,
  }));
}

export function mapCertificateToRecord(
  cert: AcademyCertificate,
  ambassadorName: string,
): CertificateRecord {
  const date = new Date(cert.issued_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    id: cert.id,
    parcoursTitle: cert.course_title ?? cert.title,
    ambassadorName,
    date,
    serial: cert.serial_number,
    signature: "Direction VSM Collection · Ambassador Academy",
    qrPayload: cert.qr_payload,
    pdfUrl: cert.pdf_url ?? undefined,
  };
}

export function certificateQrImageUrl(qrPayload: string, size = 120): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrPayload)}`;
}

export function certificateVerifyUrl(qrPayload: string): string {
  if (qrPayload.startsWith("http")) return qrPayload;
  return qrPayload;
}
