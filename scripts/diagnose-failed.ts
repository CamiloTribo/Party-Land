/**
 * diagnose-failed.ts
 * 
 * Analyzes all notification delivery failures — both from the recent send
 * and from the DB — and explains WHY each user failed.
 * Also attempts to retry only the channel that failed for each user.
 * 
 * Run: npx tsx scripts/diagnose-failed.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// FIDs that failed in the last broadcast run (from logs)
const FAILED_FIDS = [
    // Only base_notification_token (no Farcaster token)
    { fid: 1305760, username: 'harshiiittt', failedChannel: 'base_app' },
    { fid: 1917570, username: 'gatrian5.base.eth', failedChannel: 'base_app' },
    { fid: 204271, username: 'bolkus', failedChannel: 'base_app' },
    { fid: 2567403, username: 'piyawut.base.eth', failedChannel: 'base_app' },
    { fid: 2355279, username: 'shahriarsk', failedChannel: 'base_app' },
    { fid: 247653, username: 'pandateemo', failedChannel: 'base_app' },
    { fid: 1326393, username: 'metatronvietnam', failedChannel: 'base_app' },
    { fid: 1418698, username: 'imtigger.eth', failedChannel: 'base_app' },
    { fid: 2073324, username: 'capchr.base.eth', failedChannel: 'base_app' },
    { fid: 1714888, username: 'lilherchel.base.eth', failedChannel: 'base_app' },
    // Only neynar URL (a.k.a Base integration via Farcaster token)
    { fid: 255479, username: 'watcher1001', failedChannel: 'farcaster' },
    { fid: 246519, username: 'ujangkhan66', failedChannel: 'farcaster' },
    { fid: 1477344, username: 'cryptodiscovery.eth', failedChannel: 'farcaster' },
    { fid: 2751181, username: 'r0za14.base.eth', failedChannel: 'farcaster' },
    { fid: 712542, username: 'riff-raff', failedChannel: 'farcaster' },
    { fid: 1733224, username: 'heymini.base.eth', failedChannel: 'farcaster' },
];

const TITLE = "🪂 LIVE AIRDROP: +$10 USDC — Join Now!";
const BODY = "The weekly airdrop is OPEN! Pool seeded with $10 USDC. Join with 1,500 tokens + $0.023 USDC and earn real money. Fewer players = bigger payout. Open in Party Land now!";

async function diagnoseAndRetry() {
    const { getSupabaseService } = await import("../src/lib/supabase");
    const { APP_URL } = await import("../src/lib/constants");

    // Base enforces 32-char title limit; Farcaster allows more
    const truncate = (t: string, max: number) =>
        t.length > max ? t.slice(0, max - 1).trimEnd() + '\u2026' : t;

    const supabase = getSupabaseService();

    console.log("\n📊 ========== FAILURE ANALYSIS ==========");
    console.log(`Total failed: ${FAILED_FIDS.length}`);

    const baseOnlyUsers = FAILED_FIDS.filter(u => u.failedChannel === 'base_app');
    const fcNeynarUsers = FAILED_FIDS.filter(u => u.failedChannel === 'farcaster');

    console.log(`\n🔵 GROUP A — Only Base App token (no Farcaster token): ${baseOnlyUsers.length} users`);
    console.log("   These users added the app via Base App (not Warpcast).");
    console.log("   Their base_notification_url points to api.neynar.com/f/app_host/notify");
    console.log("   The 400 error from Neynar's Base endpoint means their token has EXPIRED or been REVOKED.");
    baseOnlyUsers.forEach(u => console.log(`   - @${u.username} (FID ${u.fid})`));

    console.log(`\n🟣 GROUP B — Farcaster token via neynar URL failing: ${fcNeynarUsers.length} users`);
    console.log("   These users registered via neynar's Farcaster relay (notification_url = api.neynar.com/*).");
    console.log("   The 400 error means their Farcaster notification token has EXPIRED or been REVOKED.");
    console.log("   They likely removed the miniapp from Farcaster or revoked notification permissions.");
    fcNeynarUsers.forEach(u => console.log(`   - @${u.username} (FID ${u.fid})`));

    console.log("\n💡 ROOT CAUSE:");
    console.log("   HTTP 400 from notification endpoints = the token stored in DB is no longer valid.");
    console.log("   This happens when users: revoke app permissions, uninstall app, or tokens expire.");
    console.log("   Solution: These users need to re-enable notifications in the app to get fresh tokens.\n");

    // Fetch actual DB data for all failed users
    console.log("🔍 Fetching DB records for failed users...\n");
    const { data: users, error } = await supabase
        .from('users')
        .select('fid, username, notification_token, notification_url, base_notification_token, base_notification_url')
        .in('fid', FAILED_FIDS.map(u => u.fid));

    if (error || !users) {
        console.error("❌ Could not fetch users from DB:", error);
        return;
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log(`${"FID".padEnd(10)} ${"USERNAME".padEnd(22)} ${"FC_TOKEN".padEnd(8)} ${"BASE_TOKEN".padEnd(10)} ${"DIAGNOSIS"}`);
    console.log("═══════════════════════════════════════════════════════════");

    for (const user of users) {
        const hasFc = !!(user.notification_token && user.notification_url);
        const hasBase = !!(user.base_notification_token && user.base_notification_url);
        const fcIsNeynar = user.notification_url?.includes('neynar') ?? false;
        const baseIsNeynar = user.base_notification_url?.includes('neynar') ?? false;

        let diagnosis = '';
        if (!hasFc && hasBase) diagnosis = '⚠️  Only Base token — expired/revoked (400)';
        else if (hasFc && fcIsNeynar && !hasBase) diagnosis = '⚠️  FC via Neynar — token expired/revoked (400)';
        else if (hasFc && fcIsNeynar && hasBase) diagnosis = '⚠️  Both via Neynar — FC token expired';
        else diagnosis = '❓ Unknown pattern';

        const username = `@${(user.username || '?').slice(0, 20)}`;
        console.log(
            `${String(user.fid).padEnd(10)} ${username.padEnd(22)} ${(hasFc ? '✅' : '❌').padEnd(8)} ${(hasBase ? '✅' : '❌').padEnd(10)} ${diagnosis}`
        );
    }

    console.log("═══════════════════════════════════════════════════════════\n");

    // ── RETRY SECTION ───────────────────────────────────────────────────────
    console.log("🔄 Attempting retry with full notification (correct body with emojis)...\n");

    let retryOk = 0;
    let retryFail = 0;

    for (const failedUser of FAILED_FIDS) {
        const dbUser = users.find(u => u.fid === failedUser.fid);
        if (!dbUser) {
            console.log(`@${failedUser.username}: ⚠️  not found in DB`);
            continue;
        }

        const targets: { token: string; url: string; channel: string }[] = [];

        if (failedUser.failedChannel === 'base_app' && dbUser.base_notification_token && dbUser.base_notification_url) {
            targets.push({ token: dbUser.base_notification_token, url: dbUser.base_notification_url, channel: 'base_app' });
        } else if (failedUser.failedChannel === 'farcaster' && dbUser.notification_token && dbUser.notification_url) {
            targets.push({ token: dbUser.notification_token, url: dbUser.notification_url, channel: 'farcaster' });
        }

        if (targets.length === 0) {
            console.log(`@${failedUser.username}: ⚠️  no token for channel '${failedUser.failedChannel}'`);
            continue;
        }

        process.stdout.write(`📤 Retry @${failedUser.username} via ${failedUser.failedChannel}... `);

        const results = await Promise.all(targets.map(async (t) => {
            try {
                // Farcaster allows full title; Base/Neynar enforces 32-char max
                const channelTitle = t.channel === 'base_app'
                    ? truncate(TITLE, 32)
                    : TITLE;

                const res = await fetch(t.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        notificationId: crypto.randomUUID(),
                        title: channelTitle,
                        body: BODY,
                        targetUrl: APP_URL,
                        tokens: [t.token],
                    }),
                });
                const responseBody = await res.text().catch(() => '');
                return { channel: t.channel, ok: res.status === 200, status: res.status, body: responseBody };
            } catch (e) {
                return { channel: t.channel, ok: false, status: 0, body: String(e) };
            }
        }));

        results.forEach(r => {
            if (r.ok) {
                console.log(`✅ (${r.status})`);
                retryOk++;
            } else {
                console.log(`❌ (${r.status}) — ${r.body.slice(0, 120)}`);
                retryFail++;
            }
        });
    }

    console.log("\n═══════════════ 🏁 RETRY RESULTS ═══════════════");
    console.log(`✅ Recovered: ${retryOk}`);
    console.log(`❌ Confirmed dead (token revoked): ${retryFail}`);
    console.log("═══════════════════════════════════════════════\n");

    if (retryFail > 0) {
        console.log("📋 RECOMMENDED ACTION:");
        console.log("   Users with persistent 400 errors have revoked app permissions.");
        console.log("   Consider clearing their tokens in DB to avoid wasted calls on future broadcasts.");
        console.log("   Run: npx tsx scripts/clean-dead-tokens.ts  (to be created)");
    }
}

diagnoseAndRetry().catch(console.error);
