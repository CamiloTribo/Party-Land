import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // DISABLED: best_friends API requires a paid Neynar plan
  return NextResponse.json(
    { 
      error: 'Best friends API is a premium feature. Upgrade your Neynar plan to use this.',
      users: []
    },
    { status: 200 } // Return 200 to avoid errors in the UI
  );

  /* ORIGINAL CODE - Requires paid plan
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  if (!fid) {
    return NextResponse.json(
      { error: 'FID parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=3`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const { users } = await response.json() as { users: { user: { fid: number; username: string } }[] };

    return NextResponse.json({ bestFriends: users });
  } catch (error) {
    console.error('Failed to fetch best friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best friends. Please check your Neynar API key and try again.' },
      { status: 500 }
    );
  }
} 