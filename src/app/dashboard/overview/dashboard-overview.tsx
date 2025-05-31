'use client';

import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import axiosClient from '@/services/axiosClient';
import { Budget } from '@/components/dashboard/overview/budget';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';
interface AdminData {
  totalUsers: number;
  totalAuctions: number;
  totalRequests: number;
}

interface CustomerData {
  requestCount: number;
  approvedCount: number;
  auctionCount: number;
  openAuctions: unknown[];
}

interface ManufacturerData {
  inviteCount: number;
  activeInvites: number;
}

interface DashboardResponse {
  role: 'admin' | 'customer' | 'manufacturer';
  data: AdminData | CustomerData | ManufacturerData;
}

export function DashboardOverview(): React.JSX.Element {
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

  const { role } = info;

  if (role === 'admin') {
    const data = info.data as AdminData;
    return (
      <Grid container spacing={3}>
        <Grid lg={4} sm={6} xs={12}>
          <Budget trend="up" value={String(data.totalAuctions)} sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={4} sm={6} xs={12}>
          <TotalCustomers trend="up" value={String(data.totalUsers)} sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={4} sm={6} xs={12}>
          <TotalProfit value={String(data.totalRequests)} sx={{ height: '100%' }} />
        </Grid>
        <Grid xs={12}>
          <Traffic
            chartSeries={[data.totalAuctions, data.totalUsers, data.totalRequests]}
            labels={['Auctions', 'Users', 'Requests']}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    );
  }

  if (role === 'customer') {
    const data = info.data as CustomerData;
    return (
      <Grid container spacing={3}>
        <Grid lg={4} sm={6} xs={12}>
          <Budget trend="up" value={String(data.auctionCount)} sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={4} sm={6} xs={12}>
          <TotalCustomers trend="up" value={String(data.approvedCount)} sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={4} sm={6} xs={12}>
          <TotalProfit value={String(data.requestCount)} sx={{ height: '100%' }} />
        </Grid>
        <Grid xs={12}>
          <Traffic
            chartSeries={[data.auctionCount, data.approvedCount, data.requestCount]}
            labels={['Auctions', 'Approved', 'Requests']}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    );
  }

  const data = info.data as ManufacturerData;
  return (
    <Grid container spacing={3}>
      <Grid lg={6} sm={6} xs={12}>
        <Budget trend="up" value={String(data.inviteCount)} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={6} sm={6} xs={12}>
        <TotalCustomers trend="up" value={String(data.activeInvites)} sx={{ height: '100%' }} />
      </Grid>
      <Grid xs={12}>
        <Traffic
          chartSeries={[data.inviteCount, data.activeInvites]}
          labels={['Invites', 'Active']}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}