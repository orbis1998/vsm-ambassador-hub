import { getSupabase } from "@/lib/supabase/client";
import type { PostMedia } from "@/types/social";

function extFromMime(mime: string): string {
  if (mime.startsWith("image/")) return mime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  if (mime.startsWith("video/")) return mime.split("/")[1] ?? "mp4";
  return "bin";
}

function mediaTypeFromMime(mime: string): PostMedia["type"] {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "doc";
}

export async function uploadSocialFile(userId: string, file: File): Promise<PostMedia> {
  const supabase = getSupabase();
  const ext = extFromMime(file.type);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("academy-social").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data: signed } = await supabase.storage.from("academy-social").createSignedUrl(path, 60 * 60 * 24 * 7);

  return {
    type: mediaTypeFromMime(file.type),
    path,
    url: signed?.signedUrl ?? "",
    title: file.name,
  };
}

export async function uploadProfileImage(
  userId: string,
  file: File,
  kind: "avatar" | "cover",
): Promise<string> {
  const supabase = getSupabase();
  const ext = extFromMime(file.type);
  const path = `${userId}/${kind}.${ext}`;

  const { error } = await supabase.storage.from("academy-avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("academy-avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function resolvePostMedia(media: PostMedia[]): Promise<PostMedia[]> {
  if (!media.length) return media;
  const supabase = getSupabase();

  return Promise.all(
    media.map(async (m) => {
      if (m.url?.startsWith("http")) return m;
      if (!m.path) return m;
      const { data } = await supabase.storage.from("academy-social").createSignedUrl(m.path, 60 * 60 * 24);
      return { ...m, url: data?.signedUrl ?? m.url };
    }),
  );
}
