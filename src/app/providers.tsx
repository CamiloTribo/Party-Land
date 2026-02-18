'use client';

import dynamic from 'next/dynamic';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { MiniAppProvider } from '@neynar/react';
import { SafeFarcasterSolanaProvider } from '~/components/providers/SafeFarcasterSolanaProvider';
import { GameDataProvider } from '~/components/providers/GameDataProvider';
import { ANALYTICS_ENABLED, RETURN_URL } from '~/lib/constants';

const WagmiProvider = dynamic(
  () => import('~/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const solanaEndpoint =
    process.env.SOLANA_RPC_ENDPOINT || 'https://solana-rpc.publicnode.com';
  return (
    <SessionProvider session={session}>
      <WagmiProvider>
        <MiniAppProvider
          analyticsEnabled={ANALYTICS_ENABLED}
          backButtonEnabled={true}
          returnUrl={RETURN_URL}
        >
          <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
            <GameDataProvider>
              <AuthKitProvider config={{}}>
                {children}
              </AuthKitProvider>
            </GameDataProvider>
          </SafeFarcasterSolanaProvider>
        </MiniAppProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
