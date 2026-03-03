import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import { NextRequest } from "next/server";
import { getSupabaseService } from "~/lib/supabase";
import { APP_URL, APP_NAME } from "~/lib/constants";
import { sendMiniAppNotification } from "~/lib/notifs";

export async function POST(request: NextRequest) {
  try {
    console.log('📬 [Webhook] Received event at /api/webhook');

    const requestJson = await request.json();

    let data;
    try {
      data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    } catch (e: unknown) {
      const error = e as ParseWebhookEvent.ErrorType;
      console.error('📬 [Webhook] Verification failed:', error.message);

      switch (error.name) {
        case "VerifyJsonFarcasterSignature.InvalidDataError":
        case "VerifyJsonFarcasterSignature.InvalidEventDataError":
          return Response.json({ success: false, error: error.message }, { status: 400 });
        case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
          return Response.json({ success: false, error: error.message }, { status: 401 });
        case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
          return Response.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    if (!data) {
      return Response.json({ success: false, error: "No data parsed" }, { status: 400 });
    }

    const fid = data.fid;
    const event = data.event;
    console.log(`📬 [Webhook] Event type: ${event.event} for FID: ${fid}`);

    const supabase = getSupabaseService();

    switch (event.event) {
      case "miniapp_added":
      case "notifications_enabled":
        if (event.notificationDetails) {
          const url = event.notificationDetails.url;
          const token = event.notificationDetails.token;

          // Neynar acts as the proxy for Base App, so we consider neynar/coinbase/base as Base App
          const isBaseApp = url.includes('neynar') || url.includes('coinbase') || url.includes('base');

          if (isBaseApp) {
            console.log(`📱 [Webhook] Saving Base App URL and Token for FID ${fid}`);
            await supabase
              .from('users')
              .update({
                base_notification_token: token,
                base_notification_url: url,
                updated_at: new Date().toISOString()
              })
              .eq('fid', fid);
          } else {
            console.log(`🟣 [Webhook] Saving Farcaster URL and Token for FID ${fid}`);
            await supabase
              .from('users')
              .update({
                notification_token: token,
                notification_url: url,
                updated_at: new Date().toISOString()
              })
              .eq('fid', fid);
          }

          // Welcome notification
          await sendMiniAppNotification({
            fid,
            title: `Welcome to ${APP_NAME}`,
            body: event.event === "miniapp_added" ? "Mini app added!" : "Notifications enabled!",
          });
        }
        break;

      case "miniapp_removed":
      case "notifications_disabled":
        // We preserve tokens to avoid deleting the wrong platform's token
        console.log(`📬 [Webhook] ${event.event} for FID ${fid} - (tokens preserved)`);
        break;
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('💥 [Webhook] Global error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
