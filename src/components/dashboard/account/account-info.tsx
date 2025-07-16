'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axiosClient from '@/services/axiosClient';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await axiosClient.post('/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await checkSession?.();
    } catch (err) {
      console.error('Profile image upload failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await axiosClient.delete('/profile/image');
      await checkSession?.();
    } catch (err) {
      console.error('Profile image delete failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user?.avatar || '/assets/avatar.png'} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.name || 'User'}</Typography>
            {user?.city && (
              <Typography color="text.secondary" variant="body2">
                {user.city} {user.country || ''}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
        <Button fullWidth variant="text" onClick={handleUploadClick} disabled={submitting}>
          Upload picture
        </Button>
        <Button fullWidth variant="outlined" color="error" onClick={handleDelete} disabled={submitting}>
          Delete picture
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </CardActions>
    </Card>
  );
}
