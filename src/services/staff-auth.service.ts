import { getSupabase } from "@/lib/supabase/client";

export class StaffLoginRequiredError extends Error {
  constructor() {
    super("Compte administrateur détecté. Redirection vers l'espace staff…");
    this.name = "StaffLoginRequiredError";
  }
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data: rpcData, error: rpcError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!rpcError && rpcData === true) return true;

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if ((roles ?? []).some((r) => r.role === "admin")) return true;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return profile?.role === "admin";
}

export async function signInStaff(identifier: string, password: string) {
  const supabase = getSupabase();
  const trimmed = identifier.trim().toLowerCase();
  const isEmail = trimmed.includes("@");

  const { data, error } = await supabase.auth.signInWithPassword(
    isEmail ? { email: trimmed, password } : { phone: identifier.trim(), password },
  );
  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw new Error("Identifiants incorrects. Vérifiez votre e-mail et mot de passe.");
    }
    throw error;
  }
  if (!data.session?.user) throw new Error("Session invalide.");

  const isAdmin = await checkIsAdmin(data.user.id);
  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new Error(
      "Ce compte n'a pas le rôle administrateur. Contactez VSM ou utilisez /login si vous êtes ambassadeur.",
    );
  }

  return data.session;
}

export async function fetchStaffProfile(userId: string) {
  const supabase = getSupabase();
  const { data } = await supabase.from("profiles").select("id,role,name,full_name,email,avatar_url").eq("id", userId).maybeSingle();
  return data;
}
