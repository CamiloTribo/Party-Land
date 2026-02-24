import { createClient } from '@supabase/supabase-js';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const neynarKey = process.env.NEYNAR_API_KEY!;

if (!supabaseUrl || !supabaseKey || !neynarKey) {
    console.error('❌ Missing environment variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const neynar = new NeynarAPIClient({ apiKey: neynarKey });

async function syncAllUsers() {
    console.log('🔄 Starting full user sync...');

    // 1. Fetch all FIDs from Supabase
    const { data: dbUsers, error: dbError } = await supabase
        .from('users')
        .select('fid, username, wallet_address');

    if (dbError) {
        console.error('❌ Error fetching users from DB:', dbError);
        return;
    }

    console.log(`📊 Found ${dbUsers.length} users in database.`);

    const fids = dbUsers.map(u => u.fid);

    // Neynar allows up to 100 FIDs per request
    const batchSize = 100;
    for (let i = 0; i < fids.length; i += batchSize) {
        const batchFids = fids.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${i / batchSize + 1} (${batchFids.length} users)...`);

        try {
            const { users: neynarUsers } = await neynar.fetchBulkUsers({
                fids: batchFids
            });

            for (const nUser of neynarUsers) {
                const wallet = nUser.verified_addresses?.eth_addresses?.[0] || null;

                console.log(`✨ Syncing ${nUser.username} (FID: ${nUser.fid})...`);

                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        username: nUser.username,
                        display_name: nUser.display_name,
                        pfp_url: nUser.pfp_url,
                        wallet_address: wallet,
                        updated_at: new Date().toISOString()
                    })
                    .eq('fid', nUser.fid);

                if (updateError) {
                    console.warn(`⚠️ Failed to update FID ${nUser.fid}:`, updateError.message);
                }
            }
        } catch (err: any) {
            console.error('❌ Batch error:', err.message);
        }
    }

    console.log('✅ Full sync complete!');
}

syncAllUsers().catch(console.error);
