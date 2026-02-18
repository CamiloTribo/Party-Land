import { type AccountAssociation } from '@farcaster/miniapp-core/src/manifest';

/**
 * Application constants and configuration values.
 *
 * This file contains all the configuration constants used throughout the mini app.
 * These values are either sourced from environment variables or hardcoded and provide
 * configuration for the app's appearance, behavior, and integration settings.
 *
 * NOTE: This file is automatically updated by the init script.
 * Manual changes may be overwritten during project initialization.
 */

// --- App Configuration ---
/**
 * The base URL of the application.
 * Used for generating absolute URLs for assets and API endpoints.
 */
export const APP_URL: string = process.env.NEXT_PUBLIC_URL!;

/**
 * The name of the mini app as displayed to users.
 * Used in titles, headers, and app store listings.
 */
export const APP_NAME: string = 'Party Land';

/**
 * A brief description of the mini app's functionality.
 * Used in app store listings and metadata.
 */
export const APP_DESCRIPTION: string = 'Play addictive mini-games on Farcaster! Collect tokens, unlock exclusive skins and themes with USDC. Your progress syncs across all games!';

/**
 * The primary category for the mini app.
 * Used for app store categorization and discovery.
 */
export const APP_PRIMARY_CATEGORY: string = 'games';

/**
 * Tags associated with the mini app.
 * Used for search and discovery in app stores.
 */
export const APP_TAGS: string[] = ['arcade', 'casual', 'competitive', 'tokens', 'usdc'];

// --- Asset URLs ---
/**
 * URL for the app's icon image.
 * Used in app store listings and UI elements.
 */
export const APP_ICON_URL: string = `${APP_URL}/icon.png`;

/**
 * URL for the app's Open Graph image.
 * Used for social media sharing and previews.
 */
export const APP_OG_IMAGE_URL: string = `${APP_URL}/api/opengraph-image`;

/**
 * URL for the app's splash screen image.
 * Displayed during app loading.
 */
export const APP_SPLASH_URL: string = `${APP_URL}/splash.png`;

/**
 * Background color for the splash screen.
 * Used as fallback when splash image is loading.
 */
export const APP_SPLASH_BACKGROUND_COLOR: string = '#2d0050';

/**
 * Account association for the mini app.
 * Used to associate the mini app with a Farcaster account.
 * If not provided, the mini app will be unsigned and have limited capabilities.
 */
export const APP_ACCOUNT_ASSOCIATION: AccountAssociation | undefined = {
  header: "eyJmaWQiOjI0OTg3NTcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1ZEFiQTY3ZmU1RjdmRUYxZkEwMDI2MUMxQkNlYjE5OTFhMTM4NTYwIn0",
  payload: "eyJkb21haW4iOiJwYXJ0eS1sYW5kLnZlcmNlbC5hcHAifQ",
  signature: "e88VWkw4dID1wAeZmKfbsvsvqHGzyWGgu5t+AsU/wwB+4mp6qPYJgsLdjujfShNtyOg1/hi0KHvqU6VYdmvG3Bs="
};

// --- Payment Configuration ---
/**
 * Wallet address for receiving payments from users.
 * All in-app purchases and payments will be sent to this address.
 */
export const PAYMENT_WALLET_ADDRESS: `0x${string}` = '0x27093F850B8E60E6f52610CBdD824D21ac29fbCB';

/**
 * Price for premium skins in USDC (Base network)
 */
export const PREMIUM_SKIN_PRICE_USDC = 2.3;

/**
 * Primary chain for payments (Base - optimized for low fees).
 * Base is the recommended chain for Farcaster apps due to:
 * - Very low transaction fees (~$0.001)
 * - Native USDC support
 * - High adoption among Farcaster users
 */
export const PAYMENT_CHAIN_ID = 8453; // Base mainnet

/**
 * USDC contract address on Base.
 * Used for stablecoin payments.
 */
export const USDC_ADDRESS: `0x${string}` = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';


// --- UI Configuration ---
/**
 * Text displayed on the main action button.
 * Used for the primary call-to-action in the mini app.
 */
export const APP_BUTTON_TEXT: string = 'Play Now';

/**
 * Subtitle for the mini app (shown in app store listings).
 */
export const APP_SUBTITLE: string = 'Arcade mini-games on Farcaster';

/**
 * Tagline for the mini app.
 */
export const APP_TAGLINE: string = 'Play collect and compete';

/**
 * Webhook URL for receiving events from Farcaster.
 * Explicitly set to our local endpoint to ensure we capture tokens in Supabase.
 */
export const APP_WEBHOOK_URL: string = `${APP_URL}/api/webhook`;

/**
 * Flag to enable/disable wallet functionality.
 *
 * When true, wallet-related components and features are rendered.
 * When false, wallet functionality is completely hidden from the UI.
 * Useful for mini apps that don't require wallet integration.
 */
export const USE_WALLET: boolean = true;

/**
 * Flag to enable/disable analytics tracking.
 *
 * When true, usage analytics are collected and sent to Neynar.
 * When false, analytics collection is disabled.
 * Useful for privacy-conscious users or development environments.
 */
export const ANALYTICS_ENABLED: boolean = true;

/**
 * Required chains for the mini app.
 *
 * Contains an array of CAIP-2 identifiers for blockchains that the mini app requires.
 * If the host does not support all chains listed here, it will not render the mini app.
 * If empty or undefined, the mini app will be rendered regardless of chain support.
 *
 * Supported chains: eip155:1, eip155:137, eip155:42161, eip155:10, eip155:8453,
 * solana:mainnet, solana:devnet
 */
export const APP_REQUIRED_CHAINS: string[] = [];

/**
 * Return URL for the mini app.
 *
 * If provided, the mini app will be rendered with a return URL to be rendered if the
 * back button is pressed from the home page.
 */
export const RETURN_URL: string | undefined = undefined;

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract:
    '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
};

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
];
