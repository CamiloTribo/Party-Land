/**
 * retry-fc-failed.ts
 * 
 * Retries the 6 Farcaster users that failed in the last broadcast.
 * They all use api.neynar.com as Farcaster relay — which ALSO enforces
 * the 32-char title limit. The fix in notifs.ts now handles this automatically.
 * 
 * Run: npx tsx scripts/retry-fc-failed.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// These 6 users have a Farcaster token but via Neynar relay — which also
// enforces ≤32 char title. They all got 400 in the previous broadcast.
const FC_FAILED_FIDS = [
    { fid: 255479, username: 'watcher1001' },
    { fid: 246519, username: 'ujangkhan66' },
    { fid: 1477344, username: 'cryptodiscovery.eth' },
    { fid: 2751181, username: 'r0za14.base.eth' },
    { fid: 712542, username: 'riff-raff' },
    { fid: 1733224, username: 'heymini.base.eth' },
];

async function retryFcFailed() {
    const { sendMiniAppNotification } = await import("../src/lib/notifs");

    // ⚠️ Title is auto-truncated to ≤32 chars for base_app channel by notifs.ts
    //    Farcaster relay via Neynar ALSO enforces this limit for notification_url
    const title = "🪂 AIRDROP +$10 USDC — Join Now!"; // 32 chars ✅
    const body = "The Weekly Airdrop is LIVE! Camilo seeded the pool with $10 USDC. Join with 1,500 tokens + $0.023 USDC and earn real money. Fewer players = bigger share. Open now in Party Land!";

    console.log(`\n🔄 Retrying ${FC_FAILED_FIDS.length} Farcaster users that failed in last broadcast...`);
    console.log(`📌 Title: "${title}" (${title.length} chars)`);
    console.log(`📌 Body: "${body.slice(0, 60)}..."\n`);

    let ok = 0, fail = 0;

    for (const user of FC_FAILED_FIDS) {
        process.stdout.write(`📤 @${user.username} (FID ${user.fid})... `);

        const result = await sendMiniAppNotification({ fid: user.fid, title, body });

        if (result.state === 'success') {
            const log = result.details.map(d => `${d.channel}: ${d.success ? '✅' : '❌ (' + d.status + ')'}`).join(' | ');
            console.log(log);
            ok++;
        } else if (result.state === 'error') {
            const log = result.details
                ? result.details.map(d => `${d.channel}: ❌ (${d.status || d.error})`).join(' | ')
                : result.error;
            console.log(`❌ ${log}`);
            fail++;
        } else {
            console.log(`⚠️  ${result.state}`);
            fail++;
        }
    }

    console.log("\n═══════════ 🏁 FC RETRY RESULTS ═══════════");
    console.log(`✅ Delivered: ${ok}`);
    console.log(`❌ Failed:    ${fail}`);
    console.log(`📊 Total:     ${FC_FAILED_FIDS.length}`);
    if (fail > 0) {
        console.log("\n💡 Persistent fails = user has uninstalled app or revoked permissions.");
        console.log("   Nothing more we can do until they re-open the app.");
    }
    console.log("═════════════════════════════════════════════");
}

retryFcFailed().catch(console.error);
