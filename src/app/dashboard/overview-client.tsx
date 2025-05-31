'use client';

import React from 'react';
import axiosClient from '@/services/axiosClient';

interface DashboardResponse {
  role: 'admin' | 'customer' | 'manufacturer';
  data: unknown;
}

export default function OverviewClient(): React.JSX.Element {
  const [info, setInfo] = React.useState<DashboardResponse | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    axiosClient
      .get('/dashboard/overview')
      .then((res) => setInfo(res.data as DashboardResponse))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!info) {
    return <div>Loading...</div>;
  }

  return <pre>{JSON.stringify(info, null, 2)}</pre>;
}