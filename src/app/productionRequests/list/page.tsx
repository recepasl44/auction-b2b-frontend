'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
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
  Paper
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import axiosClient from '@/services/axiosClient';

interface ProductionRequest {
  id: number;
  name?: string;
  category?: string;
  destinationPort?: string;
  createdAt?: string;
  status?: string;
}

export default function ListProductionRequestsPage() {
  const [requests, setRequests] = React.useState<ProductionRequest[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [totalCount, setTotalCount] = React.useState(0);

  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    axiosClient
      .get('/productionRequests', {
        params: {
          search: searchText || undefined,
          page: page + 1,
          limit: rowsPerPage
        }
      })
      .then((res) => {
        if (!isMounted) return;
        const data = res.data as { productionRequests: ProductionRequest[]; total: number };
        setRequests(data.productionRequests || []);
        setTotalCount(data.total || 0);
      })
      .catch((err) => {
        console.error('Error fetching production requests:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Error fetching production requests.');
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

  const handleStatusUpdate = (id: number, status: 'accepted' | 'rejected') => {
    axiosClient
      .put(`/productionRequests/${id}`, { status })
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      })
      .catch((err) => {
        console.error('Error updating production request status:', err);
      });
  };

  const handleSuperReject = (id: number) => {
    axiosClient
      .put(`/productionRequests/${id}/superReject`)
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
        );
      })
      .catch((err) => {
        console.error('Error super rejecting production request:', err);
      });
  };

  return (
    <Card>
      <CardHeader title="Production Requests" subheader="Browse and approve production requests" />
      <Divider />
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search"
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlassIcon size={18} />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 350 }}
          />
        </Stack>

        {loading && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading...</Typography>
          </Stack>
        )}

        {error && !loading && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {!loading && !error && requests.length === 0 && (
          <Typography variant="body2">No production requests found.</Typography>
        )}

        {!loading && !error && requests.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'grey.50' }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Destination Port</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((pr) => (
                  <TableRow hover key={pr.id}>
                    <TableCell>{pr.id}</TableCell>
                    <TableCell>{pr.name ?? '-'}</TableCell>
                    <TableCell>{pr.category ?? '-'}</TableCell>
                    <TableCell>{pr.destinationPort ?? '-'}</TableCell>
                    <TableCell>
                      {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {JSON.parse(localStorage.getItem('auth-data') || '{}').user?.role_id === 1 && pr.status === 'pending' ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStatusUpdate(pr.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleStatusUpdate(pr.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleSuperReject(pr.id)}
                          >
                            Super Reject
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="body2">{pr.status ?? '-'}</Typography>
                      )}
                    </TableCell>
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
          labelRowsPerPage="Requests per page"
        />
      </CardActions>
    </Card>
  );
}