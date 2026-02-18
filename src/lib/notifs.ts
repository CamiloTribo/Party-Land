import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk";
import { supabase } from "./supabase";
import { APP_URL } from "./constants";

type SendMiniAppNotificationResult =
  | {
    state: "error";
    error: unknown;
  }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendMiniAppNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendMiniAppNotificationResult> {
  // Fetch notification details from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('notification_token, notification_url')
    .eq('fid', fid)
    .single();

  if (error || !user?.notification_token || !user?.notification_url) {
    console.error(`[Notifs] No token for FID ${fid}:`, error);
    return { state: "no_token" };
  }

  const notificationDetails = {
    token: user.notification_token,
    url: user.notification_url,
  };

  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl: APP_URL,
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      // Malformed response
      return { state: "error", error: responseBody.error.errors };
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      // Rate limited
      return { state: "rate_limit" };
    }

    return { state: "success" };
  } else {
    // Error response
    return { state: "error", error: responseJson };
  }
}
