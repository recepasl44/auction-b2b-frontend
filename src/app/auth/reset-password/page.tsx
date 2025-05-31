import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { NewPasswordForm } from '@/components/auth/new-password-form';

export const metadata = { title: `Reset password | Auth | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: { token?: string };
}

export default function Page({ searchParams }: PageProps): React.JSX.Element {
  const token = searchParams?.token;

  return (
    <Layout>
      <GuestGuard>
        {token ? <NewPasswordForm token={token} /> : <ResetPasswordForm />}
      </GuestGuard>
    </Layout>
  );
}
