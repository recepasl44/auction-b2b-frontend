'use client';

import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import axiosClient from '@/services/axiosClient';

/* ───────── API response tipleri ───────── */
interface AuctionWinner {
  auctionId: number;
  winner: string;
  /* Ek alanlar varsa buraya ekleyin */
}

interface WhoWonResponse {
  endedAuctions: AuctionWinner[];
}

export default function WhoWonAuctions(): React.JSX.Element {
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState('');
  const [auctions, setAuctions] = React.useState<AuctionWinner[]>([]);

  /* ───────── Veriyi çek ───────── */
  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get<WhoWonResponse>('/reports/whoWonAuctions');
        if (!isMounted) return;

        setAuctions(data.endedAuctions ?? []);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          typeof err === 'object' && err !== null && 'response' in err
            ? // @ts-expect-error – axios tiplerine erişim
              err.response?.data?.message ?? 'Error fetching report'
            : 'Error fetching report';
        setError(String(msg));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ───────── JSX ───────── */
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Who Won Auctions</Typography>

      {loading && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading…</Typography>
        </Stack>
      )}

      {error && !loading && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {!loading && !error && auctions.length === 0 && (
        <Typography>No data</Typography>
      )}

      {!loading && !error && auctions.length > 0 && (
        <Stack spacing={1}>
          {auctions.map((a) => (
            <Typography key={a.auctionId}>
              Auction {a.auctionId} – {a.winner || 'Unknown'}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
