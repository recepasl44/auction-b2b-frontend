'use client';

import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import axiosClient from '@/services/axiosClient';
import { Traffic } from '@/components/dashboard/overview/traffic';
interface DateRangeReportResponse {
  data?: {
    auctionsCount?: number;
    ordersCount?: number;
  };
}

export default function DateRangeReport(): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [auctions, setAuctions] = React.useState(0);
  const [orders, setOrders] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

axiosClient
  .get<DateRangeReportResponse>('/reports/dateRange', {
    params: { start: '2025-01-01', end: '2025-12-31' },
  })
  .then((res) => {
        if (!isMounted) return;
        const d: DateRangeReportResponse['data'] = res.data?.data ?? {};
        setAuctions(d?.auctionsCount ?? 0);
        setOrders(d?.ordersCount ?? 0);
      })
      .catch((err: { response: { data: { message: any; }; }; }) => {
        console.error('dateRange error:', err);
        if (isMounted) setError(err.response?.data?.message || 'Error fetching report');
      })
     

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Date Range Report</Typography>
      {loading && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading...</Typography>
        </Stack>
      )}
      {error && !loading && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <Traffic
          chartSeries={[auctions, orders]}
          labels={['Auctions', 'Orders']}
          sx={{ height: '100%' }}
        />
      )}
    </Stack>
  );
}