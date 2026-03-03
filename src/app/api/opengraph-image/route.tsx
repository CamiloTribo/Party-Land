import { ImageResponse } from "next/og";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-center items-center"
        style={{
          background: 'linear-gradient(135deg, #1a0030 0%, #2d0050 40%, #4a0080 70%, #6b00b0 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background sparkles effect */}
        <div
          tw="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,105,180,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(100,0,200,0.2) 0%, transparent 50%)',
          }}
        />

        {/* Logo */}
        <div tw="flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://party-land.vercel.app/icon.png"
            alt="Party Land"
            tw="w-48 h-48 mb-6"
            style={{ borderRadius: '24px' }}
          />

          {/* Title */}
          <div
            tw="text-8xl font-black text-white text-center mb-4"
            style={{
              textShadow: '0 0 40px rgba(255,105,180,0.8), 0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '-2px',
            }}
          >
            PARTY LAND
          </div>

          {/* Subtitle */}
          <div
            tw="text-3xl font-semibold text-center"
            style={{ color: '#ff69b4' }}
          >
            🎮 Arcade mini-games on Farcaster
          </div>

          {/* Tags */}
          <div tw="flex flex-row gap-4 mt-6">
            {['Arcade', 'Casual', 'Competitive', 'USDC'].map((tag) => (
              <div
                key={tag}
                tw="px-4 py-2 rounded-full text-white text-xl font-bold"
                style={{ background: 'rgba(255,105,180,0.3)', border: '1px solid rgba(255,105,180,0.5)' }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}