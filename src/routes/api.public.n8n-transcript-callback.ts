import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public callback endpoint for n8n to update transcript request status + pdf_url.
// n8n should POST: { request_id, status, pdf_url, secret }
// Configure N8N_CALLBACK_SECRET via Lovable Cloud secrets to authenticate callbacks.
export const Route = createFileRoute("/api/public/n8n-transcript-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const expected = process.env.N8N_CALLBACK_SECRET;
          if (expected && body.secret !== expected) {
            return new Response("Unauthorized", { status: 401 });
          }
          if (!body.request_id) {
            return new Response("Missing request_id", { status: 400 });
          }
          const { error } = await supabaseAdmin
            .from("transcript_requests")
            .update({
              status: body.status ?? "completed",
              pdf_url: body.pdf_url ?? null,
              n8n_response: body,
            })
            .eq("id", body.request_id);
          if (error) return new Response(error.message, { status: 500 });
          return Response.json({ ok: true });
        } catch (e) {
          return new Response(e instanceof Error ? e.message : "error", { status: 500 });
        }
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
        }),
    },
  },
});
