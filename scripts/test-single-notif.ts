import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * USAGE:
 * npx tsx scripts/test-single-notif.ts <FID>
 */

async function testSingleNotif() {
    const fidArg = process.argv[2];
    if (!fidArg) {
        console.error("❌ Please provide an FID: npx tsx scripts/test-single-notif.ts 2498757");
        process.exit(1);
    }

    const fid = parseInt(fidArg);

    // We import dynamically to ensure dotenv.config() has run before supabase is initialized
    console.log(`🔧 Loading notification service...`);
    const { sendMiniAppNotification } = await import("../src/lib/notifs");

    console.log(`🚀 Sending test notification to FID: ${fid}...`);

    const title = "Party Land Test! 🎮";
    const body = "This is a test notification. Did you get it?";

    try {
        const result = await sendMiniAppNotification({ fid, title, body });
        if (result.state === "success") {
            console.log("✅ Notification sent successfully (Warpcast accepted it)!");
        } else if (result.state === "no_token") {
            console.log("❌ Error: No notification token found for this user in Supabase.");
            console.log("💡 Make sure you have enabled notifications in Warpcast for Party Land.");
        } else {
            console.log(`❌ Failed: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error("💥 Execution error:", error);
    }
}

testSingleNotif().catch(console.error);
