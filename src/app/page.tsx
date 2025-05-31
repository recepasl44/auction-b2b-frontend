import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { Link as MuiLink } from '@mui/material';

import { config } from '@/config';
import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';
import { CountdownTimer } from '@/components/home/countdown-timer';

function Header(): React.JSX.Element {
  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <DynamicLogo height={48} width={48} />
          <Stack direction="row" spacing={3} alignItems="center">
            <MuiLink href="#about" underline="none" color="text.primary">
              About
            </MuiLink>
            <MuiLink href="#how-it-works" underline="none" color="text.primary">
              How it works
            </MuiLink>
            <MuiLink href="#contact" underline="none" color="text.primary">
              Contact
            </MuiLink>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function Footer(): React.JSX.Element {
  return (
    <Box component="footer" sx={{ py: 4, backgroundColor: 'var(--mui-palette-background-paper)' }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center">
          <Stack direction="row" spacing={3}>
            <MuiLink href="#about" underline="hover" color="text.secondary">
              About
            </MuiLink>
            <MuiLink href="#how-it-works" underline="hover" color="text.secondary">
              How it works
            </MuiLink>
            <MuiLink href="#contact" underline="hover" color="text.secondary">
              Contact
            </MuiLink>
          </Stack>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} demaxtore
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export const metadata = {
  title: `Home | ${config.site.name}`,
  description: 'Connect with approved manufacturers and let them bid for your production requests.'
} satisfies Metadata;

const steps = [
  {
    label: 'Submit your request',
    description: 'Describe your product and desired quantity. Our team reviews each request to ensure quality and clarity.'
  },
  {
    label: 'Suppliers place bids',
    description: 'Approved manufacturers from our network join the auction and provide their best prices and lead times.'
  },
  {
    label: 'Choose the best offer',
    description: 'Compare bids and select the proposal that fits your needs. The winning supplier begins production once you confirm.'
  }
];

export default function Page(): React.JSX.Element {
  const targetDate = React.useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />

      <Box sx={{ backgroundColor: 'var(--mui-palette-background-paper)', pb: { xs: 6, md: 12 }, pt: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center">
            <DynamicLogo height={120} width={120} />
            <Typography variant="h2" align="center">
              Global Manufacturing Auctions
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Post your production requests and receive competitive bids from verified suppliers worldwide.
            </Typography>
          </Stack>
        </Container>
        <Box sx={{ mt: 4 }}>
          <Box component="img" src="/assets/product-3.png" alt="Auction hero" sx={{ width: '100%', height: { xs: 240, sm: 360, md: 480 }, objectFit: 'cover' }} />
        </Box>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button component={Link} href={paths.auth.signUp} variant="contained">
              Get Started
            </Button>
            <Button component={Link} href={paths.auth.signIn} variant="outlined">
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Typography variant="h5" align="center">
              Next global auction starts in
            </Typography>
            <CountdownTimer targetDate={targetDate} />
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'var(--mui-palette-background-default)' }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" align="center">
              Trusted by buyers worldwide
            </Typography>
            <Typography variant="h3" align="center" color="primary.main">
              1000+ orders fulfilled
            </Typography>
            <Typography align="center" color="text.secondary">
              Over 125 vetted sellers across 9 countries have successfully completed more than 1000 production auctions on our platform.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Box component="img" src="/assets/product-1.png" alt="Example 1" sx={{ width: 160, borderRadius: 1 }} />
              <Box component="img" src="/assets/product-2.png" alt="Example 2" sx={{ width: 160, borderRadius: 1 }} />
              <Box component="img" src="/assets/product-4.png" alt="Example 3" sx={{ width: 160, borderRadius: 1 }} />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box id="about" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography variant="h4" align="center">
              About demaxtore
            </Typography>
            <Typography align="center" color="text.secondary">
              demaxtore connects businesses with vetted manufacturers around the world. Our mission is to streamline custom production and deliver exceptional quality for every client.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box id="how-it-works" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={5} alignItems="center">
            <Typography variant="h4" align="center">
              How it works
            </Typography>
            <Stepper orientation="vertical" activeStep={-1} sx={{ width: '100%', maxWidth: 480 }}>
              {steps.map((step) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    <Typography color="text.secondary">{step.description}</Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </Container>
      </Box>

      <Box id="contact" sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'var(--mui-palette-background-default)' }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Typography variant="h4" align="center">
              Contact Us
            </Typography>
            <Box component="iframe" sx={{ width: '100%', height: 300, border: 0 }} src="https://www.openstreetmap.org/export/embed.html?bbox=-0.09%2C51.505%2C-0.07%2C51.515&layer=mapnik" title="Map" />
            <Stack spacing={2} component="form">
              <TextField label="Name" variant="outlined" fullWidth required />
              <TextField label="Email" variant="outlined" type="email" fullWidth required />
              <TextField label="Message" variant="outlined" multiline rows={4} fullWidth required />
              <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>Send</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'var(--mui-palette-background-paper)' }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Typography variant="h5" align="center">
              Ready to start your next project?
            </Typography>
            <Button component={Link} href={paths.auth.signUp} variant="contained">
              Create a request
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}