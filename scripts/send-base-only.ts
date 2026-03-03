/**
 * send-base-only.ts
 * 
 * Sends a notification ONLY to users who have a Base App token.
 * Useful when you want to reach Base users specifically.
 * 
 * Run: npx tsx scripts/send-base-only.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ⚠️ Base App (Neynar) enforces: Title ≤ 32 chars | Body ≤ 128 chars
const TITLE = "🪂 AIRDROP +$10 USDC — Join Now!";
const BODY = "The weekly airdrop is LIVE! Pool seeded with $10 USDC. Join with 1,500 tokens + $0.023 USDC & earn real money now! 💰🎰🎲";

async function sendBaseOnly() {
    const { getSupabaseService } = await import("../src/lib/supabase");
    const { APP_URL } = await import("../src/lib/constants");

    const supabase = getSupabaseService();

    console.log("🟦 [BASE-ONLY BROADCAST] Fetching users with Base App notifications...");
    const { data: users, error } = await supabase
        .from('users')
        .select('fid, username, base_notification_token, base_notification_url')
        .not('base_notification_token', 'is', null)
        .not('base_notification_url', 'is', null);

    if (error || !users?.length) {
        console.error("❌ Error or no users:", error);
        return;
    }

    console.log(`📈 Found ${users.length} users with Base App notifications.\n`);
    console.log(`📌 Title: "${TITLE}"`);
    console.log(`📌 Body: "${BODY}"\n`);

    let ok = 0, fail = 0;

    for (const user of users) {
        process.stdout.write(`📤 @${user.username || user.fid} (FID ${user.fid})... `);

        try {
            const res = await fetch(user.base_notification_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: crypto.randomUUID(),
                    title: TITLE,
                    body: BODY,
                    targetUrl: APP_URL,
                    tokens: [user.base_notification_token],
                }),
            });

            const responseText = await res.text().catch(() => '');

            if (res.status === 200) {
                console.log(`✅ (200)`);
                ok++;
            } else {
                console.log(`❌ (${res.status}) — ${responseText.slice(0, 100)}`);
                fail++;
            }
        } catch (e) {
            console.log(`💥 Error: ${e instanceof Error ? e.message : String(e)}`);
            fail++;
        }
    }

    console.log("\n═══════════ 🏁 BASE-ONLY RESULTS ═══════════");
    console.log(`✅ Delivered: ${ok}`);
    console.log(`❌ Failed:    ${fail}`);
    console.log(`📊 Total:     ${users.length}`);
    console.log("═════════════════════════════════════════════");
}

sendBaseOnly().catch(console.error);
