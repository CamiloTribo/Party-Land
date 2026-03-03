import { useEffect, useState } from "react";

export interface NeynarUser {
  fid: number;
  score: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  wallet_address?: string;
}

export function useNeynarUser(context?: { user?: { fid?: number } }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!context?.user?.fid) {
      setUser(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/users?fids=${context.user.fid}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.users?.[0]) {
          const nUser = data.users[0];
          setUser({
            ...nUser,
            wallet_address: nUser.verified_addresses?.eth_addresses?.[0] || null
          });
        } else {
          setUser(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [context?.user?.fid]);

  return { user, loading, error };
} 