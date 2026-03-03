// app/api/claim-usdc-milestone/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createWalletClient, http, parseUnits, createPublicClient, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import type { Abi } from "viem";

import USDC_ABI_JSON from "~/abi/USDC.json";
const USDC_ABI = USDC_ABI_JSON as Abi;

// Allow up to 30s for blockchain confirmation
export const maxDuration = 30;

// Use env RPC if available, fallback to public Base endpoint
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
});

// --- Env vars (never hardcode secrets or wallet addresses) ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CENTRAL_WALLET_PRIVATE_KEY = process.env.CENTRAL_WALLET_PRIVATE_KEY!;
const CENTRAL_WALLET_ADDRESS = (
    process.env.NEXT_PUBLIC_CENTRAL_WALLET_ADDRESS || ''
) as `0x${string}`;

// USDC contract on Base mainnet (6 decimals) — from env or known constant
const USDC_CONTRACT_ADDRESS: `0x${string}` = (
    process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
) as `0x${string}`;

// Milestone definitions (USDC only)
const USDC_MILESTONES: Record<string, { count: number; reward: number }> = {
    "100_REFS": { count: 100, reward: 0.23 },
    "1000_REFS": { count: 1000, reward: 2.3 },
};

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

export async function POST(req: NextRequest) {
    try {
        const { fid, milestoneId } = await req.json();
        console.log(`[USDC_CLAIM] 🚀 FID ${fid} claiming milestone ${milestoneId}`);

        // --- 1. Validate inputs ---
        if (!fid || typeof fid !== "number") {
            return NextResponse.json({ error: "Invalid FID." }, { status: 400 });
        }
        if (!milestoneId || !USDC_MILESTONES[milestoneId]) {
            return NextResponse.json({ error: "Invalid milestone ID." }, { status: 400 });
        }
        if (!CENTRAL_WALLET_PRIVATE_KEY) {
            console.error("[USDC_CLAIM] ❌ CENTRAL_WALLET_PRIVATE_KEY not set in env!");
            return NextResponse.json({ error: "Central wallet not configured." }, { status: 500 });
        }

        const milestone = USDC_MILESTONES[milestoneId];

        // --- 2. Verify from Supabase: referral count AND that it wasn't claimed yet ---
        const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("referral_count, wallet_address, username")
            .eq("fid", fid)
            .single();

        if (userError || !user) {
            console.error(`[USDC_CLAIM] ❌ User not found:`, userError);
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        if (!user.wallet_address || !isAddress(user.wallet_address)) {
            console.warn(`[USDC_CLAIM] ⚠️ FID ${fid} has no valid wallet address.`);
            return NextResponse.json({ error: "No valid wallet address on file. Please connect your wallet first." }, { status: 400 });
        }

        if (user.referral_count < milestone.count) {
            console.warn(`[USDC_CLAIM] ⚠️ FID ${fid} only has ${user.referral_count}/${milestone.count} referrals.`);
            return NextResponse.json({ error: `Not enough referrals. You have ${user.referral_count}, need ${milestone.count}.` }, { status: 403 });
        }

        // Check if already claimed
        const { data: existingClaim } = await supabaseAdmin
            .from("referral_claims")
            .select("id")
            .eq("fid", fid)
            .eq("milestone_id", milestoneId)
            .single();

        if (existingClaim) {
            console.warn(`[USDC_CLAIM] ⚠️ FID ${fid} already claimed ${milestoneId}.`);
            return NextResponse.json({ error: "Milestone already claimed." }, { status: 403 });
        }

        // --- 3. Record the claim IMMEDIATELY to prevent double-claims ---
        const { error: claimInsertError } = await supabaseAdmin
            .from("referral_claims")
            .insert({
                fid,
                milestone_id: milestoneId,
                reward_type: "USDC",
                reward_amount: milestone.reward,
            });

        if (claimInsertError) {
            console.error(`[USDC_CLAIM] ❌ Failed to insert claim record:`, claimInsertError);
            return NextResponse.json({ error: "Failed to register claim." }, { status: 500 });
        }
        console.log(`[USDC_CLAIM] ✅ Claim record saved for FID ${fid} - ${milestoneId}`);

        // --- 4. Setup central wallet ---
        let centralAccount;
        try {
            const privateKey = CENTRAL_WALLET_PRIVATE_KEY.startsWith("0x")
                ? CENTRAL_WALLET_PRIVATE_KEY
                : `0x${CENTRAL_WALLET_PRIVATE_KEY}`;
            centralAccount = privateKeyToAccount(privateKey as `0x${string}`);
            console.log(`[USDC_CLAIM] 🔑 Central wallet derived: ${centralAccount.address}`);

            // Safety check: derived address must match the env address
            if (
                CENTRAL_WALLET_ADDRESS &&
                centralAccount.address.toLowerCase() !== CENTRAL_WALLET_ADDRESS.toLowerCase()
            ) {
                console.error(`[USDC_CLAIM] ❌ MISMATCH! Key derives to ${centralAccount.address} but env says ${CENTRAL_WALLET_ADDRESS}`);
                return NextResponse.json({ error: "Wallet configuration mismatch. Contact support." }, { status: 500 });
            }
        } catch (err) {
            console.error("[USDC_CLAIM] ❌ Error creating central account:", err);
            return NextResponse.json({ error: "Error configuring central wallet." }, { status: 500 });
        }

        // --- 5. Prepare USDC transfer (6 decimals on Base) ---
        const amountInUnits = parseUnits(milestone.reward.toString(), 6);
        console.log(`[USDC_CLAIM] 💰 Sending ${milestone.reward} USDC (${amountInUnits} units) to ${user.wallet_address}`);

        const currentNonce = await publicClient.getTransactionCount({
            address: centralAccount.address,
            blockTag: "pending",
        });
        console.log(`[USDC_CLAIM] 🔢 Nonce: ${currentNonce}`);

        const walletClient = createWalletClient({
            account: centralAccount,
            chain: base,
            transport: http(RPC_URL),
        });

        // --- 6. Simulate first, then send ---
        const { request } = await publicClient.simulateContract({
            address: USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [user.wallet_address as `0x${string}`, amountInUnits],
            account: centralAccount,
        });
        console.log(`[USDC_CLAIM] ✅ Simulation passed.`);

        const transactionHash = await walletClient.writeContract({
            address: request.address,
            abi: request.abi,
            functionName: request.functionName,
            args: request.args,
            account: centralAccount,
            nonce: currentNonce,
            gas: BigInt(100000),
            maxFeePerGas: BigInt(1500000000), // 1.5 gwei - Base fees are very low
        });
        console.log(`[USDC_CLAIM] ✅ TX SENT! Hash: ${transactionHash}`);

        // --- 7. Log transaction in DB (with all fields populated) ---
        await supabaseAdmin.from("transactions").insert({
            fid,
            username: user.username ?? null,
            wallet_address: user.wallet_address,
            type: "REFERRAL_MILESTONE_USDC",
            amount: milestone.reward,
            currency: "USDC",
            description: `USDC payout for milestone ${milestoneId} (${milestone.count} referrals)`,
            tx_hash: transactionHash,
        });

        return NextResponse.json({
            success: true,
            reward: milestone.reward,
            transactionHash,
            toAddress: user.wallet_address,
            message: `${milestone.reward} USDC sent to your wallet! TX: ${transactionHash}`,
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[USDC_CLAIM] ❌ FATAL ERROR:", errorMessage);
        return NextResponse.json(
            { error: "Failed to process USDC claim.", details: errorMessage },
            { status: 500 }
        );
    }
}
