import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testSingleUser() {
    const { sendMiniAppNotification } = await import("../src/lib/notifs");
    const { getSupabaseService } = await import("../src/lib/supabase");

    const fid = 2498757; // User's FID
    const supabase = getSupabaseService();

    console.log(`🔍 Checking DB for FID ${fid}...`);
    const { data: user } = await supabase
        .from('users')
        .select('notification_token, notification_url, base_notification_url')
        .eq('fid', fid)
        .single();

    console.log("DB Record:", user);

    console.log(`\n🚀 Sending test notification to FID ${fid}...`);
    const result = await sendMiniAppNotification({
        fid,
        title: "🧪 Test Party Land",
        body: "Si ves esto en Warpcast Y en Coinbase, ¡ha funcionado! 🎉"
    });

    console.log("\n✅ Result:", result);
}

testSingleUser().catch(console.error);
