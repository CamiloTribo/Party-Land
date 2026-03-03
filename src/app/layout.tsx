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
    'talentapp:project_verification': '50d453746ea3cd594b4b581928573558644a44caba3566d2a21e0fab1d9d4ee3492cb35c7821f78a8a6a5fc0a960b360769208282206361dc47ac5a48c00a8a4',
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
