import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function sendBroadcast() {
    const title = process.argv[2] || "Message from Party Land 🎡";
    const body = process.argv[3] || "We have new updates! Come and check them out.";

    console.log(`🚀 Starting broadcast (Anon mode)...`);
    console.log(`Message: "${title}" - "${body}"`);

    // Dynamically import to ensure dotenv.config() has run
    const { supabase } = await import("../src/lib/supabase");
    const { sendMiniAppNotification } = await import("../src/lib/notifs");

    // Fetch all users with valid notification tokens using Anon client
    const { data: users, error } = await supabase
        .from('users')
        .select('fid, username')
        .not('notification_token', 'is', null);

    if (error) {
        console.error("❌ Error fetching users from Supabase:", error);
        console.log("💡 Tip: Using Anon key. Ensure RLS allows reading 'users' table.");
        return;
    }

    if (!users || users.length === 0) {
        console.log("⚠️ No users found with notifications enabled (or RLS restricted).");
        return;
    }

    console.log(`Found ${users.length} users to notify.`);

    for (const user of users) {
        try {
            console.log(`Sending to @${user.username} (FID: ${user.fid})...`);
            const result = await sendMiniAppNotification({
                fid: user.fid,
                title,
                body
            });

            if (result.state === "success") {
                console.log(`✅ Success for @${user.username}`);
            } else {
                console.log(`❌ Failed for @${user.username}: ${result.state}`);
            }
        } catch (error) {
            console.error(`💥 Error sending to FID ${user.fid}:`, error);
        }
    }

    console.log("🏁 Broadcast completed.");
}

sendBroadcast().catch(console.error);
