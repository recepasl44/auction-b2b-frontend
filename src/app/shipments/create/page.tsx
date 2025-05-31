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
    Select,
    MenuItem,
    Typography
} from '@mui/material';
import axiosClient from '@/services/axiosClient';

type ShipmentTypeOption = 'sea' | 'air' | 'land';

export default function CreateShipmentPage() {
    const [orderId, setOrderId] = React.useState('');
    const [shipmentType, setShipmentType] = React.useState<ShipmentTypeOption>('sea');
    const [containerNo, setContainerNo] = React.useState('');
    const [shipDate, setShipDate] = React.useState('');
    const [arrivalEstimate, setArrivalEstimate] = React.useState('');
    const [status, setStatus] = React.useState('planned');

    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // POST /api/shipments
            // body: { orderId, shipmentType, containerNo, shipDate, arrivalEstimate, status }
            const resp = await axiosClient.post('/shipments', {
                orderId: parseInt(orderId, 10),
                shipmentType,
                containerNo,
                shipDate,
                arrivalEstimate,
                status
            });

            console.log('Shipment created:', resp.data);
            setSuccessMessage('Shipment created successfully!');
            setOrderId('');
            setShipmentType('sea');
            setContainerNo('');
            setShipDate('');
            setArrivalEstimate('');
            setStatus('planned');
        } catch (err: any) {
            console.error('Error creating shipment:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to create shipment.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setOrderId('');
        setShipmentType('sea');
        setContainerNo('');
        setShipDate('');
        setArrivalEstimate('');
        setStatus('planned');
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader
                    title="Create Shipment"
                    subheader="Provide shipping details for an order"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Order ID</InputLabel>
                                <OutlinedInput
                                    label="Order ID"
                                    placeholder="e.g. 1"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                                <FormHelperText>The related order for this shipment.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Shipment Type</InputLabel>
                                <Select
                                    label="Shipment Type"
                                    value={shipmentType}
                                    onChange={(e) => setShipmentType(e.target.value as ShipmentTypeOption)}
                                >
                                    <MenuItem value="sea">Sea</MenuItem>
                                    <MenuItem value="air">Air</MenuItem>
                                    <MenuItem value="land">Land</MenuItem>
                                </Select>
                                <FormHelperText>Transport method (sea/air/land).</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Container No</InputLabel>
                                <OutlinedInput
                                    label="Container No"
                                    placeholder="ABC123"
                                    value={containerNo}
                                    onChange={(e) => setContainerNo(e.target.value)}
                                />
                                <FormHelperText>Container or tracking number.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Ship Date</InputLabel>
                                <OutlinedInput
                                    label="Ship Date"
                                    type="datetime-local"
                                    value={shipDate}
                                    onChange={(e) => setShipDate(e.target.value)}
                                />
                                <FormHelperText>When the shipment departs.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Arrival Estimate</InputLabel>
                                <OutlinedInput
                                    label="Arrival Estimate"
                                    type="datetime-local"
                                    value={arrivalEstimate}
                                    onChange={(e) => setArrivalEstimate(e.target.value)}
                                />
                                <FormHelperText>Estimated arrival date/time.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Status</InputLabel>
                                <OutlinedInput
                                    label="Status"
                                    placeholder="planned / shipped / delivered"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                <FormHelperText>Shipment's current status (planned, shipped, delivered...).</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>

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
                        {loading ? 'Saving...' : 'Save Shipment'}
                    </Button>
                </CardActions>
            </Card>
        </form>
    );
}
