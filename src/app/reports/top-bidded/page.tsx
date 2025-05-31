'use client';

import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import axiosClient from '@/services/axiosClient';
import { Chart } from '@/components/core/chart';
import type { ApexOptions } from 'apexcharts';

/* ───────── API response tipleri ───────── */
interface AuctionReportItem {
  id: number;
  title: string;
  bidCount: number;
}

interface TopBiddedResponse {
  auctions: AuctionReportItem[];
}

export default function TopBiddedReport(): React.JSX.Element {
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState('');
  const [labels, setLabels]     = React.useState<string[]>([]);
  const [counts, setCounts]     = React.useState<number[]>([]);

  /* ───────── Veriyi çek ───────── */
  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get<TopBiddedResponse>('/reports/topBidded');
        if (!isMounted) return;

        const list = data.auctions ?? [];
        setLabels(list.map((a) => a.title));
        setCounts(list.map((a) => a.bidCount));
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

  /* ───────── Grafik ayarları ───────── */
  const options: ApexOptions = {
    chart:  { background: 'transparent', toolbar: { show: false } },
    xaxis:  { categories: labels },
    dataLabels: { enabled: false },
  };

  /* ───────── JSX ───────── */
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Top Bidded Auctions</Typography>

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

      {!loading && !error && labels.length > 0 && (
        <Chart
          height={350}
          options={options}
          series={[{ name: 'Bids', data: counts }]}
          type="bar"
          width="100%"
        />
      )}

      {!loading && !error && labels.length === 0 && (
        <Typography>No data</Typography>
      )}
    </Stack>
  );
}
