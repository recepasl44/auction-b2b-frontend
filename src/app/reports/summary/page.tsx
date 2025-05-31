'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CircularProgress, Stack, Typography } from '@mui/material';
import axiosClient from '@/services/axiosClient';
import { Traffic } from '@/components/dashboard/overview/traffic';

import { Users as UsersIcon, Gavel as AuctionIcon, ShoppingCart as OrdersIcon } from '@phosphor-icons/react';
// Not actual icon names, pick any you like from phosphor icons

export default function SystemSummaryPage() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [totalAuctions, setTotalAuctions] = React.useState(0);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [totalUsers, setTotalUsers] = React.useState(0);

    type SummaryResponse = {
        message: string;
        data: {
            totalAuctions: number;
            totalOrders: number;
            totalUsers: number;
        };
    };

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError('');

        axiosClient
            .get<SummaryResponse>('/reports/summary')
            .then((res) => {
                if (!isMounted) return;

                // example: { message: "Sistem özet raporu", data: { totalAuctions, totalOrders, totalUsers } }
                const summary = res.data?.data || {};
                setTotalAuctions(summary.totalAuctions || 0);
                setTotalOrders(summary.totalOrders || 0);
                setTotalUsers(summary.totalUsers || 0);
            })
            .catch((err) => {
                console.error('Error fetching summary:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Error fetching summary.');
                }
                if (isMounted) setLoading(false);
            })
            .then(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Stack spacing={3}>
            <Typography variant="h4">System Summary</Typography>

            {loading && (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading summary...</Typography>
                </Stack>
            )}
            {error && !loading && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}

            {!loading && !error && (
             <>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        {/* Card 1: Auctions */}
                        <Card sx={{ flex: 1 }}>
                            <CardHeader title="Total Auctions" />
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <AuctionIcon size={32} />
                                    <Typography variant="h3">{totalAuctions}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>


                    {/* Card 2: Orders */}
                       <Card sx={{ flex: 1 }}>
                            <CardHeader title="Total Orders" />
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <OrdersIcon size={32} />
                                    <Typography variant="h3">{totalOrders}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    {/* Card 3: Users */}
                            {/* Card 3: Users */}
                        <Card sx={{ flex: 1 }}>
                            <CardHeader title="Total Users" />
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <UsersIcon size={32} />
                                    <Typography variant="h3">{totalUsers}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                    <Traffic
                        chartSeries={[totalAuctions, totalOrders, totalUsers]}
                        labels={['Auctions', 'Orders', 'Users']}
                        sx={{ height: '100%' }}
                    />
                </>
    )
            }
        </Stack>
    );
}
