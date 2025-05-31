'use client';

import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Divider,
    IconButton,
    Stack,
    TextField,
    InputAdornment,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ArrowsClockwise as RefreshIcon } from '@phosphor-icons/react';
import { PencilSimple as EditIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/services/axiosClient';

interface Setting {
    id: number;
    key: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export default function SettingsListPage() {
    const router = useRouter();
    const [settings, setSettings] = React.useState<Setting[]>([]);
    const [filtered, setFiltered] = React.useState<Setting[]>([]);
    const [search, setSearch] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const fetchSettings = React.useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axiosClient.get<{ settings: Setting[] }>('/settings');
            setSettings(res.data.settings);
            setFiltered(res.data.settings);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ayarlar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    React.useEffect(() => {
        if (!search) {
            setFiltered(settings);
        } else {
            const term = search.toLowerCase();
            setFiltered(
                settings.filter((s) => s.key.toLowerCase().includes(term) || s.value.toLowerCase().includes(term))
            );
        }
    }, [search, settings]);

    return (
        <Card>
            <CardHeader
                title="Settings"
                subheader="Manage application configuration"
                action={
                    <IconButton onClick={fetchSettings} disabled={loading}>
                        <RefreshIcon size={20} />
                    </IconButton>
                }
            />
            <Divider />
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search settings"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MagnifyingGlassIcon size={18} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: '1 1 auto', maxWidth: 400 }}
                    />
                </Stack>

                {loading && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading settings…</Typography>
                    </Stack>
                )}

                {error && !loading && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <Typography variant="body2">No settings found.</Typography>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Key</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Updated At</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell>{s.key}</TableCell>
                                        <TableCell>{s.value}</TableCell>
                                        <TableCell>
                                            {new Date(s.updatedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon size={16} />}
                                                onClick={() => router.push(`/settings/${encodeURIComponent(s.key)}`)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
            <CardActions>
                {/* Could add bulk actions here */}
            </CardActions>
        </Card>
    );
}
