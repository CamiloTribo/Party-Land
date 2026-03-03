
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function fixFarcasterUrls() {
    const { getSupabaseService } = await import("../src/lib/supabase");
    const supabase = getSupabaseService();

    console.log("🧹 [CLEANUP] Resetting Farcaster notification URLs to official endpoint...");

    // Default Farcaster notification endpoint
    const OFFICIAL_URL = "https://api.farcaster.xyz/v1/frame-notifications";

    // Update all users whose notification_url contains 'neynar' or matches known neynar endpoints
    const { data, error } = await supabase
        .from('users')
        .update({
            notification_url: OFFICIAL_URL,
            updated_at: new Date().toISOString()
        })
        .or(`notification_url.ilike.%neynar%,notification_url.ilike.%app_host/notify%`)
        .select('fid');

    if (error) {
        console.error("❌ Error during cleanup:", error.message);
        return;
    }

    console.log(`✅ Success! Updated ${data?.length || 0} users back to official Farcaster URLs.`);
}

fixFarcasterUrls().catch(console.error);
