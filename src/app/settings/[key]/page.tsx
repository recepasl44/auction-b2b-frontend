'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Divider,
    Button,
    TextField,
    Stack,
    CircularProgress,
    Typography
} from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react';
import axiosClient from '@/services/axiosClient';

export default function EditSettingPage() {
    const router = useRouter();
    const { key } = useParams() as { key: string };

    const [value, setValue] = React.useState('');
    const [initialLoad, setInitialLoad] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // Load current value
    React.useEffect(() => {
        let mounted = true;
        setInitialLoad(true);
        axiosClient
            .get<{ settings: { key: string; value: string }[] }>('/settings')
            .then((res) => {
                if (!mounted) return;
                const record = res.data.settings.find((s) => s.key === key);
                if (record) {
                    setValue(record.value);
                } else {
                    setError('Setting not found.');
                }
            })
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.message || 'Could not load setting.');
            })
            .then(() => {
                if (mounted) setInitialLoad(false);
            });
        return () => {
            mounted = false;
        };
    }, [key]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosClient.put(`/settings/${encodeURIComponent(key)}`, { value });
            setSuccess('Setting updated successfully.');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader
                title={`Edit Setting: ${key}`}
                subheader="Modify and save configuration value"
                action={
                    <Button
                        startIcon={<BackIcon size={16} />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                }
            />
            <Divider />
            <CardContent>
                {(initialLoad || loading) && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <CircularProgress size={20} />
                        <Typography>
                            {initialLoad ? 'Loading…' : 'Saving…'}
                        </Typography>
                    </Stack>
                )}

                {error && !loading && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {!initialLoad && !error && (
                    <form id="edit-setting-form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={loading}
                        />
                    </form>
                )}

                {success && (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                        {success}
                    </Typography>
                )}
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                    type="submit"
                    form="edit-setting-form"
                    variant="contained"
                    disabled={initialLoad || loading}
                >
                    Save
                </Button>
            </CardActions>
        </Card>
    );
}
