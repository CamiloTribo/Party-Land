'use client';

import { useMiniApp } from '@neynar/react';
import { LogIn, User } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useState, useEffect } from 'react';
import { soundManager } from '~/lib/SoundManager';

interface GameAuthButtonProps {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  fid?: number;
}

export function GameAuthButton({ username, displayName, pfpUrl, fid }: GameAuthButtonProps) {
  const { context } = useMiniApp();
  const [showProfile, setShowProfile] = useState(false);

  // If we're in Farcaster/Warpcast and user is authenticated
  const isAuthenticated = !!context?.user?.fid || !!fid;

  // Debug logging
  useEffect(() => {
    console.log('🔐 [GameAuthButton] Auth check:', {
      contextFid: context?.user?.fid,
      propFid: fid,
      username,
      displayName,
      isAuthenticated
    });
  }, [context, fid, username, displayName, isAuthenticated]);

  if (isAuthenticated && username) {
    // Show user profile button
    return (
      <div className="relative">
        <button
          onClick={() => {
            soundManager.play('click');
            setShowProfile(!showProfile);
          }}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-4 py-2 transition-all shadow-lg border-2 border-white/40"
        >
          {pfpUrl ? (
            <img
              src={pfpUrl}
              alt={username}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-white font-bold text-sm">
            @{username}
          </span>
        </button>

        {/* Profile dropdown */}
        {showProfile && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-purple-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-white/30 min-w-[200px] z-50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                {pfpUrl ? (
                  <img
                    src={pfpUrl}
                    alt={username}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white font-bold text-sm">{displayName || username}</p>
                  <p className="text-white/70 text-xs">@{username}</p>
                </div>
              </div>
              <div className="text-white/80 text-xs pt-2">
                <p>FID: {fid}</p>
                <p className="text-green-400 font-semibold mt-1">✓ Authenticated</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show sign in prompt for web users
  return (
    <div className="flex flex-col items-center gap-2 bg-purple-900/80 backdrop-blur-md rounded-2xl p-4 border-2 border-yellow-400/50 shadow-2xl">
      <div className="flex items-center gap-2 text-yellow-300">
        <User className="w-5 h-5" />
        <span className="font-bold text-sm">Not Signed In</span>
      </div>
      <p className="text-white/80 text-xs text-center mb-2">
        Open in your app to authenticate
      </p>
      <Button
        size="sm"
        className="text-xs font-bold px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-lg flex items-center gap-2"
        onClick={() => {
          soundManager.play('click');
          // This will only work in a Farcaster-compatible client
          if (context) {
            window.location.reload();
          } else {
            alert('Please open this app in Warpcast to sign in with Farcaster');
          }
        }}
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}
