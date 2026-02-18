import dotenv from "dotenv";
dotenv.config();

import { sendMiniAppNotification } from "../src/lib/notifs";
import { APP_NAME } from "../src/lib/constants";
import { getSupabaseService } from "../src/lib/supabase";

async function sendDailyReminders() {
    console.log("🚀 Starting daily reminders...");
    const supabase = getSupabaseService();

    // Fetch all users with valid notification tokens
    const { data: users, error } = await supabase
        .from('users')
        .select('fid')
        .not('notification_token', 'is', null);

    if (error) {
        console.error("❌ Error fetching users from Supabase:", error);
        return;
    }

    const fids = users.map(u => u.fid);
    console.log(`Found ${fids.length} users with notifications enabled.`);

    const title = `Time to play! 🎮`;
    const body = `Have you played Party Land today? Come and beat your high score!`;

    for (const fid of fids) {
        try {
            console.log(`Sending notification to FID: ${fid}...`);
            const result = await sendMiniAppNotification({ fid, title, body });
            if (result.state === "success") {
                console.log(`✅ Sent to ${fid}`);
            } else {
                console.log(`❌ Failed for ${fid}: ${result.state}`);
            }
        } catch (error) {
            console.error(`💥 Error sending to ${fid}:`, error);
        }
    }

    console.log("🏁 Daily reminders completed.");
}

sendDailyReminders().catch(console.error);
