/**
 * send-broadcast.ts
 * 
 * Sends a mass notification to ALL users with at least one active notification channel.
 * Each user can receive on up to 2 channels:
 *   - Farcaster (api.farcaster.xyz) → allows full title (up to ~64 chars)
 *   - Base App  (api.neynar.com)    → ⚠️ STRICT 32-char limit on title!
 * 
 * The notifs.ts lib handles truncation automatically for base_app titles.
 * But try to keep titles short so both channels get the full impact!
 * 
 * Logs show each channel result per user:
 *   farcaster: ✅ | base_app: ✅   → both delivered
 *   farcaster: ✅ | base_app: ❌   → Base token expired/revoked (user removed app)
 *   ❌ Fail → ...                  → all channels failed for that user
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function sendBroadcast() {
    // Dynamically import to ensure dotenv.config() has run
    const { getSupabaseService } = await import("../src/lib/supabase");
    const { sendMiniAppNotification } = await import("../src/lib/notifs");

    // ─── NOTIFICATION CONTENT ───────────────────────────────────────────────
    // ⚠️  Base App (Neynar) enforces a 32-char max on the title!
    //     notifs.ts will auto-truncate for base_app, but keep it short here.
    //     Farcaster allows longer titles (the full string below).
    const defaultTitle = "🪂 AIRDROP +$10 USDC — Join Now!"; // ≤32 chars ✅
    const defaultBody = "The Weekly Airdrop is LIVE! Camilo seeded the pool with $10 USDC. Join with 1,500 tokens + $0.023 USDC and earn real money. Fewer players = bigger share. Open now in Party Land!";
    // ────────────────────────────────────────────────────────────────────────

    const title = process.argv[2] || defaultTitle;
    const body = process.argv[3] || defaultBody;


    console.log(`🚀 [BROADCAST] Starting mass notification...`);
    console.log(`📌 Title: "${title}"`);
    console.log(`📌 Body:  "${body}"`);

    const supabase = getSupabaseService();

    // Fetch all users with valid notification tokens (either Farcaster or Base App)
    console.log("🔍 Fetching target users from Supabase...");
    const { data: users, error } = await supabase
        .from('users')
        .select('fid, username')
        .or('notification_token.not.is.null, base_notification_token.not.is.null');

    if (error) {
        console.error("❌ Error fetching users:", error);
        return;
    }

    if (!users || users.length === 0) {
        console.log("⚠️ No users found with notifications enabled.");
        return;
    }

    console.log(`📈 Ready to notify ${users.length} users.`);
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        try {
            process.stdout.write(`📤 Sending to @${user.username || user.fid}... `);
            const result = await sendMiniAppNotification({
                fid: user.fid,
                title,
                body
            });

            if (result.state === "success") {
                const log = result.details.map(d => `${d.channel}: ${d.success ? '✅' : '❌ (' + d.status + ')'}`).join(' | ');
                console.log(log);
                successCount++;
            } else if (result.state === "error") {
                const log = result.details ? result.details.map(d => `${d.channel}: ❌ (${d.status || d.error})`).join(' | ') : result.error;
                console.log(`❌ Fail -> ${log}`);
                failCount++;
            } else {
                console.log(`⚠️ (${result.state})`);
                failCount++;
            }
        } catch (error) {
            console.error(`💥 Unexpected error for FID ${user.fid}:`, error);
            failCount++;
        }
    }

    console.log("\n--- 🏁 Broadcast Result ---");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed:  ${failCount}`);
    console.log(`📊 Total:   ${users.length}`);
    console.log("----------------------------");
}

sendBroadcast().catch(console.error);
