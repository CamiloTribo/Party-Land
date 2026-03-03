import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const FAILED_FIDS = [
    255479, 246519, 1733224, 1477344, 2751181, 712542, 204271, 1305760,
    1917570, 2567403, 2355279, 247653, 1326393, 1418698, 2073324, 1714888
];

const URL_FARCASTER = "https://api.farcaster.xyz/v1/frame-notifications";
const URL_NEYNAR = "https://api.neynar.com/f/app_host/notify";

async function retryWithForce() {
    const { getSupabaseService } = await import("../src/lib/supabase");
    const supabase = getSupabaseService();

    const title = "🪂 AIRDROP TODAY + 🃏 Joker Offer";
    const body = "The first Weekly Airdrop pool launches TODAY! 🎰 Don't miss your chance and grab the Pink Joker at $0.023 before it's too late. Stay tuned... we are live in 3, 2, 1... 🚀🔥";

    console.log(`🔄 Retrying with URL swap logic for ${FAILED_FIDS.length} users...`);

    for (const fid of FAILED_FIDS) {
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('fid', fid)
            .single();

        if (!user) {
            console.log(`❌ FID ${fid}: User not found`);
            continue;
        }

        // Recogemos todos los tokens posibles
        const tokensToTry = [];
        if (user.notification_token) tokensToTry.push({ token: user.notification_token, originalUrl: user.notification_url });
        if (user.base_notification_token) tokensToTry.push({ token: user.base_notification_token, originalUrl: user.base_notification_url });

        let fixed = false;

        for (const item of tokensToTry) {
            // Probamos las dos URLs para cada token
            const urlsToTry = [URL_FARCASTER, URL_NEYNAR];

            for (const url of urlsToTry) {
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            notificationId: crypto.randomUUID(),
                            title,
                            body,
                            targetUrl: "https://party-land.vercel.app",
                            tokens: [item.token],
                        }),
                    });

                    if (response.status === 200) {
                        console.log(`✅ FID ${fid} (@${user.username}) FIXED! Worked with: ${url === URL_FARCASTER ? 'Farcaster' : 'Neynar'}`);
                        fixed = true;
                        break;
                    }
                } catch (e) {
                    // Sigue probando
                }
            }
            if (fixed) break;
        }

        if (!fixed) {
            console.log(`❌ FID ${fid} (@${user.username}) STILL FAILING: Tokens likely expired or app uninstalled.`);
        }
    }
}

retryWithForce().catch(console.error);
