import { listAllUserNotificationFids } from "../src/lib/kv";
import { sendMiniAppNotification } from "../src/lib/notifs";
import { APP_NAME } from "../src/lib/constants";
import dotenv from "dotenv";

dotenv.config();

async function sendDailyReminders() {
    console.log("🚀 Starting daily reminders...");

    const fids = await listAllUserNotificationFids();
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
