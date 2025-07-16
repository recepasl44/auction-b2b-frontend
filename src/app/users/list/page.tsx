'use client';

import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Divider,
    Button,
    Stack,
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
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import {
    MagnifyingGlass as MagnifyingGlassIcon,
    Plus as PlusIcon,
} from '@phosphor-icons/react';
import axiosClient from '@/services/axiosClient';

interface UserItem {
    id: number;
    email: string;
    name: string;
    role_id: number;
    // extra fields if any
}

export default function ListUsersPage() {
    const [users, setUsers] = React.useState<UserItem[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [totalCount, setTotalCount] = React.useState(0);

    const [searchText, setSearchText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const [openDialog, setOpenDialog] = React.useState(false);
    const [newEmail, setNewEmail] = React.useState('');
    const [newName, setNewName] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [newRoleId, setNewRoleId] = React.useState(2);
    const [submitLoading, setSubmitLoading] = React.useState(false);
    const [submitError, setSubmitError] = React.useState('');

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError('');

        axiosClient
            .get('/users', {
                params: {
                    search: searchText || undefined,
                    page: page + 1,
                    limit: rowsPerPage
                }
            })
            .then((res) => {
                if (!isMounted) return;

                // Suppose /api/users => { users: UserItem[], total: number }
                const data = res.data as { users: UserItem[]; total: number };
                const list = data.users || [];
                const total = data.total || list.length;

                setUsers(list);
                setTotalCount(total);
                if (isMounted) setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching users:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Error fetching users.');
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

    const handleNewUser = () => {
        setNewEmail('');
        setNewName('');
        setNewPassword('');
        setNewRoleId(2);
        setSubmitError('');
        setOpenDialog(true);
    };

    const handleCreate = async () => {
        setSubmitLoading(true);
        setSubmitError('');
        try {
            await axiosClient.post('/users', {
                email: newEmail,
                password: newPassword,
                name: newName,
                role_id: newRoleId
            });
            setOpenDialog(false);
            // refresh
            setPage(0);
            setSearchText('');
        } catch (err: any) {
            console.error('Error creating user:', err);
            setSubmitError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader
                    title="List All Users"
                    subheader="Browse registered users, or add new ones"
                />
                <Divider />
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Search users"
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
                        <Button variant="contained" startIcon={<PlusIcon />} onClick={handleNewUser}>
                            New User
                        </Button>
                    </Stack>

                    {loading && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading users...</Typography>
                        </Stack>
                    )}

                    {error && !loading && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}

                    {!loading && !error && users.length === 0 && (
                        <Typography variant="body2">No users found.</Typography>
                    )}

                    {!loading && !error && users.length > 0 && (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Role</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((item) => (
                                        <TableRow hover key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.email}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.role_id}</TableCell>
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
                        labelRowsPerPage="Users per page"
                    />
                </CardActions>
            </Card>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>New User</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            label="Role"
                            value={newRoleId}
                            onChange={(e) => setNewRoleId(Number(e.target.value))}
                        >
                            <MenuItem value={1}>Admin</MenuItem>
                            <MenuItem value={2}>Customer</MenuItem>
                            <MenuItem value={3}>Manufacturer</MenuItem>
                            <MenuItem value={4}>Supplier</MenuItem>
                        </Select>
                    </FormControl>
                    {submitError && (
                        <Typography color="error" variant="body2">
                            {submitError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} disabled={submitLoading}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={submitLoading}>
                        {submitLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
