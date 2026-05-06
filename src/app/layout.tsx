import type { Metadata } from 'next';

import { getSession } from '~/auth';
import '~/app/globals.css';
import { Providers } from '~/app/providers';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

// Force dynamic rendering — layout uses getSession() (headers()) so static
// pre-rendering of any route (including _not-found) would fail.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: '/web-favicon.png',
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/api/opengraph-image'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/api/opengraph-image'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:name': APP_NAME,
    'fc:frame:icon': '/app-store-icon.png',
    'fc:frame:category': 'game',
    'base:app_id': '699eee0074175638d96bf31d',
    'talentapp:project_verification': 'ea0afb51967688084e396cf202a34ea6c88f414622fec42e3024c817489ccff7c7368aa19745bff0fcd676c9e46dc0e12d0a88bac39e98d50a23a91aab9c1f23',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
