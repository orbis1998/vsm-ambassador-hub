/**
 * Edge Function — envoi Web Push Academy (VAPID)
 * Secrets Supabase : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:admin@vsmcollection.com)
 *
 * Déployer : supabase functions deploy academy-web-push
 * Webhook DB : INSERT sur academy_notifications → POST cette function
 */
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  user_id: string;
  title: string;
  body: string;
  link?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@vsmcollection.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys missing" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const payload = (await req.json()) as Payload;
    if (!payload?.user_id || !payload?.title) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: subs, error } = await supabase
      .from("academy_push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", payload.user_id);

    if (error) throw error;
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body ?? "",
      url: payload.link ?? "/notifications",
    });

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload,
        );
        sent += 1;
      } catch (e) {
        console.error("push failed", sub.endpoint, e);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
