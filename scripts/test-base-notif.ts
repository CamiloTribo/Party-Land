import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testBaseNotif() {
    const fid = 2498757;
    const baseToken = "019ca030-07fe-b94a-6e72-a145e9ea48c8";
    const baseUrl = "https://api.neynar.com/f/app_host/notify";

    const title = "🧪 Base App Test";
    const body = "Testing notification specifically for Base App channel. If you see this, it works! 🔵";

    console.log(`📡 [TEST] Sending to Base App specifically for FID ${fid}...`);
    console.log(`🔗 URL: ${baseUrl}`);
    console.log(`🔑 Token: ${baseToken}`);

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                notificationId: crypto.randomUUID(),
                title,
                body,
                targetUrl: "https://party-land.vercel.app",
                tokens: [baseToken],
            }),
        });

        const status = response.status;
        const text = await response.text();

        console.log(`\n--- 📊 Response ---`);
        console.log(`Status: ${status}`);
        console.log(`Body:   ${text}`);

        if (status === 200) {
            console.log(`✅ Success! Check your Base App.`);
        } else {
            console.log(`❌ Failed. This endpoint/token combination is not working.`);
        }
    } catch (e) {
        console.error("💥 Error during fetch:", e);
    }
}

testBaseNotif().catch(console.error);
