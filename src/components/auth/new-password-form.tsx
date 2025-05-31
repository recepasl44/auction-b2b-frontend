'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

const schema = zod
  .object({
    password: zod.string().min(6, { message: 'Password should be at least 6 characters' }),
    confirmPassword: zod.string().min(6, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type Values = zod.infer<typeof schema>;

interface Props {
  token: string;
}

const defaultValues = { password: '', confirmPassword: '' } satisfies Values;

export function NewPasswordForm({ token }: Props): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.updatePassword({
        token,
        newPassword: values.password,
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);
      router.replace(paths.auth.signIn);
    },
    [token, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Set new password</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>New password</InputLabel>
                <OutlinedInput {...field} label="New password" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)}>
                <InputLabel>Confirm password</InputLabel>
                <OutlinedInput {...field} label="Confirm password" type="password" />
                {errors.confirmPassword ? (
                  <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Reset password
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}