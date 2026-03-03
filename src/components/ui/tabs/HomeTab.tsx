"use client";

/**
 * HomeTab component displays the main landing content for the mini app.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
      <div className="text-center w-full max-w-md mx-auto space-y-4">
        <h2 className="text-3xl font-bold mb-4">🎉 Party Land!</h2>
        <p className="text-lg mb-2">Welcome to your Farcaster Mini App</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explore the tabs below to:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left max-w-xs mx-auto">
          <li>⚡ Try actions and share</li>
          <li>📋 View your Farcaster context</li>
          <li>💰 Connect and manage wallets</li>
        </ul>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">Powered by Neynar 🪐</p>
      </div>
    </div>
  );
} 