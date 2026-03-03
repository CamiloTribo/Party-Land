import {
  SendNotificationRequest,
} from "@farcaster/miniapp-sdk";
import { getSupabaseService } from "./supabase";
import { APP_URL } from "./constants";

// Base App (Neynar) enforces a strict 32-char limit on notification titles.
// Farcaster (api.farcaster.xyz) allows longer titles (~64 chars).
const BASE_APP_TITLE_MAX = 32;
const BASE_APP_BODY_MAX = 128;

function truncateForChannel(text: string, max: number, channel: "farcaster" | "base_app", type: "title" | "body"): string {
  if (channel === "base_app" && text.length > max) {
    const truncated = text.slice(0, max - 1).trimEnd() + '…';
    console.log(`[Notifs] ✂️  ${type} truncated for base_app (${text.length} → ${truncated.length} chars): "${truncated}"`);
    return truncated;
  }
  return text;
}

export type SingleNotifResult = {
  channel: "farcaster" | "base_app";
  url: string;
  success: boolean;
  status?: number;
  error?: string;
};

type SendMiniAppNotificationResult =
  | {
    state: "error";
    error: string;
    details?: SingleNotifResult[];
  }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success"; details: SingleNotifResult[] };

export async function sendMiniAppNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendMiniAppNotificationResult> {
  const supabase = getSupabaseService();

  // Fetch user containing both potential notification channels and tokens
  const { data: user, error } = await supabase
    .from('users')
    .select('notification_token, notification_url, base_notification_token, base_notification_url')
    .eq('fid', fid)
    .single();

  if (error || !user) {
    console.warn(`[Notifs] User not found for FID ${fid}`);
    return { state: "no_token" };
  }

  const targets: { token: string; url: string; channel: "farcaster" | "base_app" }[] = [];

  // Add Farcaster target if exists
  if (user.notification_token && user.notification_url) {
    targets.push({
      token: user.notification_token,
      url: user.notification_url,
      channel: "farcaster"
    });
  }

  // Add Base App target if exists
  if (user.base_notification_token && user.base_notification_url) {
    targets.push({
      token: user.base_notification_token,
      url: user.base_notification_url,
      channel: "base_app"
    });
  }

  if (targets.length === 0) {
    return { state: "no_token" };
  }

  console.log(`[Notifs] Sending to ${targets.length} target(s) for FID ${fid}`);

  const details = await Promise.all(targets.map(async (entry): Promise<SingleNotifResult> => {
    try {
      const channelTitle = truncateForChannel(title, BASE_APP_TITLE_MAX, entry.channel, "title");
      const channelBody = truncateForChannel(body, BASE_APP_BODY_MAX, entry.channel, "body");

      const response = await fetch(entry.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: crypto.randomUUID(),
          title: channelTitle,
          body: channelBody,
          targetUrl: APP_URL,
          tokens: [entry.token],
        } satisfies SendNotificationRequest),
      });

      return {
        channel: entry.channel,
        url: entry.url,
        success: response.status === 200,
        status: response.status
      };
    } catch (e) {
      return {
        channel: entry.channel,
        url: entry.url,
        success: false,
        error: e instanceof Error ? e.message : String(e)
      };
    }
  }));

  const anySuccess = details.some(d => d.success);

  if (anySuccess) {
    return { state: "success", details };
  } else {
    return { state: "error", error: "Delivery failed for all targets", details };
  }
}
