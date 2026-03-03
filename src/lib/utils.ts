import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import sdk from '@farcaster/miniapp-sdk';
import { Manifest } from '@farcaster/miniapp-core/src/manifest';
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
  APP_SUBTITLE,
  APP_TAGLINE,
  APP_SCREENSHOT_URLS,
  BUILDER_CODE,
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: 'next',
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: {
      version: '1',
      name: APP_NAME,
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT,
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      description: APP_DESCRIPTION,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      tagline: APP_TAGLINE,
      subtitle: APP_SUBTITLE,
      ogTitle: APP_NAME,
      ogDescription: APP_DESCRIPTION.substring(0, 100),
      ogImageUrl: APP_OG_IMAGE_URL,
      screenshotUrls: APP_SCREENSHOT_URLS,
      heroImageUrl: APP_OG_IMAGE_URL,
      noindex: false,
    } as any,
  };
}

export function shareToFarcaster(text: string) {
  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(APP_URL)}`;
  if (typeof window !== 'undefined') {
    sdk.actions.openUrl({ url });
  }
}

/**
 * Attaches the Base Builder Code suffix to transaction data for onchain attribution.
 * Follows EIP-8021 format: [len][code]00 + 16 bytes of 8021 marker.
 */
export function attachBuilderCode(data: string = '0x'): `0x${string}` {
  if (!BUILDER_CODE) return data as `0x${string}`;

  // 1. Code in hex
  const codeHex = Array.from(BUILDER_CODE)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

  // 2. Length of code in 1 byte hex
  const len = BUILDER_CODE.length.toString(16).padStart(2, '0');

  // 3. Schema ID (00 for default)
  const schemaId = '00';

  // 4. 8021 marker repeated 8 times (16 bytes)
  const marker = '8021'.repeat(8);

  const suffix = `${codeHex}${len}${schemaId}${marker}`;

  // Ensure data starts with 0x and append suffix
  const baseData = data.startsWith('0x') ? data : `0x${data}`;
  return `${baseData}${suffix}` as `0x${string}`;
}
