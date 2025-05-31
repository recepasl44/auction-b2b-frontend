'use client';

import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Stack,
    Button,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    IconButton
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import axiosClient from '@/services/axiosClient';

interface OrderItem {
    id: number;
    orderNumber: string;
    createdAt: string;
    status: string;
    // ek alanlar: totalAmount, currency, etc.
}

export default function ListOrdersPage() {
    const [orders, setOrders] = React.useState<OrderItem[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [totalCount, setTotalCount] = React.useState(0);

    const [searchText, setSearchText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // Fetch orders
    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError('');

        axiosClient
            .get('/orders', {
                params: {
                    search: searchText || undefined,
                    page: page + 1,       // 1-based or adapt to your backend
                    limit: rowsPerPage
                }
            })
            .then((res) => {
                if (!isMounted) return;

                // Suppose the API returns { orders: OrderItem[], total: number }
                const data = res.data as { orders: OrderItem[]; total: number };
                const list = data.orders || [];
                const total = data.total || 0;

                setOrders(list);
                setTotalCount(total);
            })
            .catch((err) => {
                console.error('Error fetching orders:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Error fetching orders.');
                }
            })
            .then(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [searchText, page, rowsPerPage]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        setPage(0);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleNewOrder = () => {
        alert('Create new Order clicked');
        // Possibly router.push('/orders/create');
    };

    return (
        <Card>
            <CardHeader
                title="List Orders"
                subheader="Browse existing orders, filter, or create new ones"
                action={
                    <IconButton color="primary" onClick={handleNewOrder}>
                        <PlusIcon size={22} />
                    </IconButton>
                }
            />
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search orders"
                        value={searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MagnifyingGlassIcon size={18} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 350 }}
                    />
                    <Button variant="contained" startIcon={<PlusIcon />} onClick={handleNewOrder}>
                        New Order
                    </Button>
                </Stack>

                {loading && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading orders...</Typography>
                    </Stack>
                )}

                {error && !loading && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                {!loading && !error && orders.length === 0 && (
                    <Typography variant="body2">No orders found.</Typography>
                )}

                {!loading && !error && orders.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Order Number</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Status</TableCell>
                                    {/* ek columns (like totalAmount) */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((item) => (
                                    <TableRow hover key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.orderNumber}</TableCell>
                                        <TableCell>
                                            {dayjs(item.createdAt).format('MMM D, YYYY HH:mm')}
                                        </TableCell>
                                        <TableCell>{item.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Orders per page"
                />
            </CardActions>
        </Card>
    );
}
