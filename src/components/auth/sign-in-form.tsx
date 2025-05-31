'use client';

import React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

// Bu import'u kendi axios ayarlarınızla değiştirin.
// Örneğin src/lib/axiosClient.js vb. bir yerde "baseURL: <your-api-url>" tanımlanmış olsun.
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

// TypeScript yerine JavaScript kullanıyoruz. Zod şemayı yine koruyabiliriz:
const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

// Zod'u JS’de de kullanabiliriz (tipleri atlıyoruz). 
// Varsayılan giriş değerleri:
const defaultValues = {
  email: 'admin@test.com',
  password: '123456',
};

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  // POST /api/auth/login (Postman koleksiyonundaki endpoint)
  const onSubmit = React.useCallback(
async (values: { email: string; password: string }) => {
        setIsPending(true);
      try {
        // Burada doğrudan axiosClient ile isteği yapıyoruz.
        // Postman'daki login endpoint: body { email, password }
 const { error } = await authClient.signInWithPassword({
            email: values.email,
          password: values.password,
        });

        // Backend’den dönen veriyi alabilirsiniz:
      if (error) {
          setError('root', { type: 'server', message: error });
          setIsPending(false);
          return;
        }

        router.replace('/dashboard');

      } catch (error) {
        console.error('Login error:', error);
        // Hata mesajını ekranda göstermek için react-hook-form "root" alanına atıyoruz.
        // Postman API 'message' döndürüyorsa oradan okuyun (ör: error.response?.data?.message).
        setError('root', {
          type: 'server',
               message: 'oturum açma hatası',
        });
      } finally {
        setIsPending(false);
      }
    },
    [setError, router]

  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </form>

      <Alert color="warning">
        Use{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          test@mail.com
        </Typography>{' '}
        with password{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          123456
        </Typography>
      </Alert>
    </Stack>
  );
}
