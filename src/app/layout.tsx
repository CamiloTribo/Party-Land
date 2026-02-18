import type { Metadata } from 'next';

import { getSession } from '~/auth';
import '~/app/globals.css';
import { Providers } from '~/app/providers';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: '/icon.png',
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
    'fc:frame:icon': '/icon.png',
    'fc:frame:category': 'game',
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
