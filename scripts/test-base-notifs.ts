import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config({ path: ".env.local" });

async function testBaseAppOnly() {
    const { getSupabaseService } = await import("../src/lib/supabase");

    const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://party-land.vercel.app';
    const fid = 2498757;
    const supabase = getSupabaseService();

    console.log(`🔍 Fetching Base App notification details for FID ${fid}...`);
    const { data: user } = await supabase
        .from('users')
        .select('base_notification_token, base_notification_url')
        .eq('fid', fid)
        .single();

    if (!user || !user.base_notification_url || !user.base_notification_token) {
        console.error("❌ Missing token or Base App URL for this user");
        return;
    }

    console.log("DB Record:");
    console.log("  - Base Token:", user.base_notification_token);
    console.log("  - Base URL:", user.base_notification_url);

    console.log(`\n🚀 Sending ONLY to Base App...`);

    try {
        const payload = {
            notificationId: crypto.randomUUID(),
            title: "🔵 Base App Exclusive",
            body: "🚀 Notificando desde Vercel directo a Coinbase app!",
            targetUrl: APP_URL,
            tokens: [user.base_notification_token],
        };

        console.log("Payload:", payload);

        const response = await fetch(user.base_notification_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        console.log(`\n📡 HTTP Status Code: ${response.status}`);

        const responseText = await response.text();
        console.log(`💬 Raw Response:`, responseText);

    } catch (e) {
        console.error("\n💥 Fetch crashed:", e);
    }
}

testBaseAppOnly().catch(console.error);
