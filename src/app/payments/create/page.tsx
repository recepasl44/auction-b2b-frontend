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

type PaymentTypeOption = 'partial' | 'full';

export default function CreatePaymentSchedulePage() {
    const [orderId, setOrderId] = React.useState('');
    const [paymentType, setPaymentType] = React.useState<PaymentTypeOption>('partial');
    const [amount, setAmount] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');
    const [isPaid, setIsPaid] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // POST /api/payments
            // body: { orderId, paymentType, amount, dueDate, isPaid }
            const resp = await axiosClient.post('/payments', {
                orderId: parseInt(orderId, 10),
                paymentType,
                amount: parseFloat(amount),
                dueDate,     // e.g. '2025-01-01'
                isPaid
            });

            console.log('Payment schedule created:', resp.data);
            setSuccessMessage('Payment schedule created successfully!');
            setOrderId('');
            setPaymentType('partial');
            setAmount('');
            setDueDate('');
            setIsPaid(false);
        } catch (err: any) {
            console.error('Error creating payment:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to create payment schedule.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setOrderId('');
        setPaymentType('partial');
        setAmount('');
        setDueDate('');
        setIsPaid(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader
                    title="Create Payment Schedule"
                    subheader="Set up a payment plan for an order"
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
                                <FormHelperText>
                                    The order for which you are scheduling a payment.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Payment Type</InputLabel>
                                <Select
                                    label="Payment Type"
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value as PaymentTypeOption)}
                                >
                                    <MenuItem value="partial">Partial</MenuItem>
                                    <MenuItem value="full">Full</MenuItem>
                                </Select>
                                <FormHelperText>Specify whether it's partial or full payment.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Amount</InputLabel>
                                <OutlinedInput
                                    label="Amount"
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <FormHelperText>Payment amount (numeric).</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel>Due Date</InputLabel>
                                <OutlinedInput
                                    label="Due Date"
                                    type="date"
                                    placeholder="2025-01-01"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                                <FormHelperText>Deadline for this payment (YYYY-MM-DD).</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required fullWidth>
                                <InputLabel htmlFor="isPaidField">Is Paid?</InputLabel>
                                <Select
                                    label="Is Paid?"
                                    id="isPaidField"
                                    value={isPaid ? 'true' : 'false'}
                                    onChange={(e) => setIsPaid(e.target.value === 'true')}
                                >
                                    <MenuItem value="false">No</MenuItem>
                                    <MenuItem value="true">Yes</MenuItem>
                                </Select>
                                <FormHelperText>Whether this payment is already fulfilled.</FormHelperText>
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
                        {loading ? 'Saving...' : 'Save Payment'}
                    </Button>
                </CardActions>
            </Card>
        </form>
    );
}
