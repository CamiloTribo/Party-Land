import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testDualNotif() {
    // Dynamically import
    const { sendMiniAppNotification } = await import("../src/lib/notifs");

    const fid = 2498757; // Camilo
    const title = "📡 Dual Channel Test";
    const body = "Testing Farcaster + Base App channels with detailed logs. 🎰";

    console.log(`🚀 [TEST] Starting dual-channel notification test for @camilin23 (FID ${fid})...`);

    try {
        const result = await sendMiniAppNotification({
            fid,
            title,
            body
        });

        console.log("\n--- 🏁 Test Result ---");
        if (result.state === "success") {
            const log = result.details.map(d => `${d.channel.toUpperCase()}: ${d.success ? '✅ Success (200)' : '❌ Failed (Status: ' + d.status + ')'}`).join('\n');
            console.log(log);
        } else if (result.state === "error") {
            const log = result.details ? result.details.map(d => `${d.channel.toUpperCase()}: ❌ Failed (Status: ${d.status || d.error})`).join('\n') : result.error;
            console.log(`❌ CRITICAL FAILURE ->\n${log}`);
        } else {
            console.log(`📡 Result state: ${result.state}`);
        }
        console.log("----------------------");

    } catch (error) {
        console.error("💥 Unexpected crash during test:", error);
    }
}

testDualNotif().catch(console.error);
