"use client";
import * as React from 'react';
import RouterLink from 'next/link';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';

interface PageProps {
  searchParams: { token?: string };
}

export default function Page({ searchParams }: PageProps): React.JSX.Element {
  const token = searchParams?.token;
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setError('No token provided');
      return;
    }

    authClient.verifyEmail(token).then(({ error, message }) => {
      if (error) {
        setError(error);
      } else {
        setMessage(message ?? 'Email verified');
      }
    });
  }, [token]);

  return (
    <Layout>
      <GuestGuard>
        <Stack spacing={3} sx={{ textAlign: 'center' }}>
          <Typography variant="h5">Verify email</Typography>
          {message && <Alert color="success">{message}</Alert>}
          {error && <Alert color="error">{error}</Alert>}
          <Button component={RouterLink} href={paths.auth.signIn} variant="contained">
            Go to sign in
          </Button>
        </Stack>
      </GuestGuard>
    </Layout>
  );
}