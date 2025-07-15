'use client';

import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Divider,
    Button,
    Grid,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    MenuItem,
    Select,
    Typography,
    Stack,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Alert
} from '@mui/material';
import axiosClient from '@/services/axiosClient';
const currencyOptions = ['USD', 'EUR', 'TRY', 'GBP'];
interface Supplier {
    id: number;
    name: string;
    email: string;
}
export default function AuctionCreatePage() {
    const [title, setTitle] = React.useState('');
    const [startTime, setStartTime] = React.useState('');
    const [endTime, setEndTime] = React.useState('');
    const [startPrice, setStartPrice] = React.useState('');
    const [endPrice, setEndPrice] = React.useState('');
    const [productionId, setProductionId] = React.useState('');
    const [supplierIds, setSupplierIds] = React.useState<number[]>([]);
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [openSuppliers, setOpenSuppliers] = React.useState(false);
    const [incrementStep, setIncrementStep] = React.useState('');
    const [baseCurrency, setBaseCurrency] = React.useState('');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [productionInfo, setProductionInfo] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const [toastOpen, setToastOpen] = React.useState(false);
const handleOpenSuppliers = () => {
        setOpenSuppliers(true);
        if (suppliers.length === 0) {
            axiosClient
                .get<{ users: Supplier[] }>('/users')
                .then((res) => {
                    setSuppliers(res.data.users || []);
                })
                .catch((err) => {
                    console.error('Error fetching suppliers:', err);
                });
        }
    };

    const handleCloseSuppliers = () => {
        setOpenSuppliers(false);
    };

    const handleToggleSupplier = (sid: number) => {
        setSupplierIds((prev) =>
            prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
        );
    };
    const pathname = window.location.pathname;
    const id = pathname.split('/').pop();

    React.useEffect(() => {
        const role = JSON.parse(localStorage.getItem('auth-data') || '{}').user?.role_id;
        if (role === 1 && id) {
            axiosClient.get(`/productionRequests/${id}`)
                .then((res) => setProductionInfo((res.data as { productionRequest?: any })?.productionRequest || null))
                .catch(() => {});
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // POST /api/auctions
            // Body: { title, startTime, endTime, startPrice, endPrice, incrementStep, baseCurrency }
            const response = await axiosClient.post('/auctions', {
                title,
                startTime,
                endTime,
                startPrice: parseFloat(startPrice),
                endPrice: endPrice ? parseFloat(endPrice) : undefined,
                incrementStep: parseFloat(incrementStep),
                baseCurrency,
                sortDirection,
                productionId: id,
                supplierIds
            });

            console.log('Auction created:', response.data);
            setSuccessMessage('Auction created successfully!');
            setToastOpen(true);
            // Reset form
            setTitle('');
            setStartTime('');
            setEndTime('');
            setStartPrice('');
            setEndPrice('');
            setIncrementStep('');
            setBaseCurrency('');
            setProductionId('');
            setSupplierIds([]);
        } catch (err: any) {
            console.error('Error creating auction:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to create auction.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTitle('');
        setStartTime('');
        setEndTime('');
        setStartPrice('');
        setEndPrice('');
        setIncrementStep('');
        setBaseCurrency('');
        setSortDirection('asc');
        setProductionId('');
        setSupplierIds([]);
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader
                    title="Create Auction"
                    subheader="Please fill out the auction details below"
                />
                <Divider />
                <CardContent>
                    {productionInfo && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Production Request Info
                            </Typography>
                            <Stack spacing={0.5}>
                                {Object.entries(productionInfo).map(([k, v]) => (
                                    <Typography key={k} variant="body2">
                                        {k}: {String(v)}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    )}
                    <Grid container spacing={3}>
                         
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Title</InputLabel>
                                <OutlinedInput
                                    label="Title"
                                    placeholder="Example: Elma İhalesi"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <FormHelperText>
                                    Name or description of the auction (e.g., product or item name).
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Start Time</InputLabel>
                                <OutlinedInput
                                    label="Start Time"
                                    type="datetime-local"
                                    placeholder="YYYY-MM-DD HH:mm"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                                <FormHelperText>
                                    When the auction will begin (UTC ISO format).
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>End Time</InputLabel>
                                <OutlinedInput
                                    label="End Time"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                                <FormHelperText>
                                    Auction closing time. Must be after start time.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Start Price</InputLabel>
                                <OutlinedInput
                                    label="Start Price"
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={startPrice}
                                    onChange={(e) => setStartPrice(e.target.value)}
                                />
                                <FormHelperText>
                                    Minimum starting bid amount.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>End Price</InputLabel>
                                <OutlinedInput
                                    label="End Price"
                                    type="number"
                                    placeholder="e.g. 200"
                                    value={endPrice}
                                    onChange={(e) => setEndPrice(e.target.value)}
                                />
                                <FormHelperText>
                                    Optional maximum threshold for bidding (if any).
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Increment Step</InputLabel>
                                <OutlinedInput
                                    label="Increment Step"
                                    type="number"
                                    placeholder="e.g. 10"
                                    value={incrementStep}
                                    onChange={(e) => setIncrementStep(e.target.value)}
                                />
                                <FormHelperText>
                                    Each new bid must be at least this amount higher.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Base Currency</InputLabel>
                                <Select
                                    label="Base Currency"
                                    value={baseCurrency}
                                    onChange={(e) => setBaseCurrency(e.target.value as string)}
                                >
                                    {currencyOptions.map((curr) => (
                                        <MenuItem key={curr} value={curr}>
                                            {curr}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Currency used for this auction (USD, EUR, etc.).
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Sort Direction</InputLabel>
                                <Select
                                    label="Sort Direction"
                                    value={sortDirection}
                                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                                >
                                    <MenuItem value="asc">Ascending</MenuItem>
                                    <MenuItem value="desc">Descending</MenuItem>
                                </Select>
                                <FormHelperText>
                                    Choose whether the auction price increases or decreases
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                         <Grid xs={12} md={6}>
                            <Button variant="outlined" onClick={handleOpenSuppliers}>
                                Select Suppliers
                            </Button>
                            {supplierIds.length > 0 && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected {supplierIds.length} supplier(s)
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    {/* Error / Success Messages */}
                    {errorMessage && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    {successMessage && (
                        <Typography color="success.main" sx={{ mt: 2 }}>
                            {successMessage}
                        </Typography>
                    )}
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleReset} disabled={loading}>
                        Reset
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Auction'}
                    </Button>
                </CardActions>
            </Card>
             <Dialog open={openSuppliers} onClose={handleCloseSuppliers} maxWidth="sm" fullWidth>
                <DialogTitle>Select Suppliers</DialogTitle>
                <DialogContent>
                    <List>
                        {suppliers.map((s) => (
                            <ListItem key={s.id} dense button onClick={() => handleToggleSupplier(s.id)}>
                                <Checkbox checked={supplierIds.includes(s.id)} />
                                <ListItemText primary={s.name} secondary={s.email} />
                            </ListItem>
                        ))}
                        {suppliers.length === 0 && <Typography>No suppliers found.</Typography>}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuppliers}>Close</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToastOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </form>
    );
}
