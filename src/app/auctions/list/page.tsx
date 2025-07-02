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
    IconButton,
       Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import axiosClient from '@/services/axiosClient';
import { useRouter } from 'next/navigation';
interface ProductionRequest {
    id: number;
    name?: string;
    description?: string;
    category?: string;
}

interface AuctionItem {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    startPrice: number;
    endPrice?: number;
    incrementStep: number;
    baseCurrency: string;
      productionId?: number;
          invite_status?: string;

    // extra fields if needed
}

export default function ListAuctionsPage() {
    const router = useRouter();
    const [openModal, setOpenModal] = React.useState(false);
    const [productionRequests, setProductionRequests] = React.useState<ProductionRequest[]>([]);
    const [prLoading, setPrLoading] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState<number>(1);
   const [roleId, setRoleId] = React.useState<number | undefined>();
    const [userId, setUserId] = React.useState<number | undefined>();

    const [auctions, setAuctions] = React.useState<AuctionItem[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [totalCount, setTotalCount] = React.useState(0);

    const [searchText, setSearchText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('auth-data');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed?.user?.role_id) {
                        setRoleId(Number(parsed.user.role_id));
                    }
                    if (parsed?.user?.id) {
                        setUserId(Number(parsed.user.id));
                    }
                } catch {
                    // ignore
                }
            }
        }
    }, []);

    // fetch auctions
    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError('');

        axiosClient
            .get('/auctions', {
                params: {
                    search: searchText || undefined,
                    page: page + 1,
                    limit: rowsPerPage
                }
            })
            .then((res) => {
                if (!isMounted) return;
                // Suppose your API returns { auctions: AuctionItem[], total: number }
                const data = res.data as { auctions: AuctionItem[]; total: number };
                const items = data.auctions || [];
                const total = data.total || 0;
                setAuctions(items);
                setTotalCount(total);
                if (isMounted) setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching auctions:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Error fetching auctions.');
                    setLoading(false);
                }
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
 const handleSelectProduction = (id: number) => {
        setOpenModal(false);
        router.push(`/auctions/${id}`);
    };

    const handleNewAuction = () => {
                setOpenModal(true);
        setPrLoading(true);
        axiosClient
            .get('/productionRequests')
            .then((res) => {
                const data = res.data as { productionRequests: ProductionRequest[] };
                setProductionRequests(data.productionRequests || []);
                setPrLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching production requests:', err);
                setPrLoading(false);
            });
    };
 const handleInviteAction = (inviteId: number, action: 'accepted' | 'declined') => {
        axiosClient
            .post('/auctions/respondInvite', {
                inviteId,
                action,
            })
            .then(() => {
                setAuctions((prev) =>
                    prev.map((a) =>
                        a.id === inviteId ? { ...a, invite_status: action } : a
                    )
                );
            })
            .catch((err) => {
                console.error('Error responding to invite:', err);
            });
    };

    return (
         <>
        <Card>
            <CardHeader
                title="List Auctions"
                subheader="Browse all existing auctions, filter, or create new ones"
                action={
                    <IconButton color="primary" onClick={handleNewAuction}>
                        <PlusIcon size={22} />
                    </IconButton>
                }
            />
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search auctions"
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
                    <Button variant="contained" startIcon={<PlusIcon />} onClick={handleNewAuction}>
                        New Auction
                    </Button>
                </Stack>

                {loading && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading auctions...</Typography>
                    </Stack>
                )}

                {error && !loading && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                {!loading && !error && auctions.length === 0 && (
                    <Typography variant="body2">No auctions found.</Typography>
                )}

                {!loading && !error && auctions.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Auction ID</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Production ID</TableCell>

                                    <TableCell>Start - End</TableCell>
                                    <TableCell>Start Price</TableCell>
                                    <TableCell>End Price</TableCell>
                                    <TableCell>Increment</TableCell>
                                    <TableCell>Base Currency</TableCell>
                                  {roleId === 3 && <TableCell align="right">Actions</TableCell>}

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {auctions.map((item) => (
                                    <TableRow hover key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.title}</TableCell>
                                                                             <TableCell>{item.productionId ?? '-'}</TableCell>

                                        <TableCell>
                                            {dayjs(item.startTime).format('MMM D, YYYY HH:mm')} -{' '}
                                            {dayjs(item.endTime).format('MMM D, YYYY HH:mm')}
                                        </TableCell>
                                        <TableCell>{item.startPrice}</TableCell>
                                        <TableCell>{item.endPrice ?? '-'}</TableCell>
                                        <TableCell>{item.incrementStep}</TableCell>
                                        <TableCell>{item.baseCurrency}</TableCell>
                                                   {roleId === 3 && (
                                            <TableCell align="right">
                                                {item.invite_status === 'invited' ? (
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleInviteAction(item.id, 'accepted')}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleInviteAction(item.id, 'declined')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                ) : item.invite_status === 'accepted' && dayjs(item.startTime).isBefore(dayjs()) ? (
                                                    <Button variant="contained" size="small" onClick={() => router.push(`/auctions/${item.id}`)}>
                                                        Join
                                                    </Button>
                                                ) : (
                                                    <Typography variant="body2">{item.invite_status ?? '-'}</Typography>
                                                )}
                                            </TableCell>
                                        )}
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
                    labelRowsPerPage="Auctions per page"
                />
            </CardActions>
        </Card>
          <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
            <DialogTitle>Select Production Request</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>User</InputLabel>
                    <Select value={selectedUserId} label="User" onChange={(e) => setSelectedUserId(Number(e.target.value))}>
                        <MenuItem value={1}>User 1</MenuItem>
                        <MenuItem value={2}>User 2</MenuItem>
                        <MenuItem value={3}>User 3</MenuItem>
                    </Select>
                </FormControl>
                {prLoading ? (
                    <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                        <CircularProgress size={20} />
                    </Stack>
                ) : (
                    <List>
                        {productionRequests.map((pr) => (
                            <ListItem button onClick={() => handleSelectProduction(pr.id)} key={pr.id}>
                                <ListItemText primary={`#${pr.id} - ${pr.name || pr.category || ''}`} secondary={pr.description} />
                            </ListItem>
                        ))}
                        {productionRequests.length === 0 && (
                            <Typography>No production requests found.</Typography>
                        )}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenModal(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
