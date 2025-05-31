'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const total = Math.max(targetDate.getTime() - Date.now(), 0);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, days, hours, minutes, seconds };
}

function TimeUnit({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4">{String(value).padStart(2, '0')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export function CountdownTimer({ targetDate }: CountdownTimerProps): React.JSX.Element {
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  React.useEffect(() => {
    const tick = () => setTimeLeft(calculateTimeLeft(targetDate));
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [targetDate]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <Stack direction="row" spacing={2} justifyContent="center">
      <TimeUnit label="Days" value={days} />
      <TimeUnit label="Hours" value={hours} />
      <TimeUnit label="Minutes" value={minutes} />
      <TimeUnit label="Seconds" value={seconds} />
    </Stack>
  );
}