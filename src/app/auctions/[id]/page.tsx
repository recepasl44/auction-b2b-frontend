'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  SyntheticEvent,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import axiosClient from '@/services/axiosClient';
import { parseIsoAsLocal } from '@/lib/parseIsoAsLocal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Divider,
  TextField,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';


//------------------------------------------------------------------
// Types
//------------------------------------------------------------------
interface Auction {
  sortDirection: string;
  id: number;
  description: string;
  title: string;
  lastOffer?: string;
  your_nickname?: string;
  startTime: string;
  endTime: string;
  startPrice: string;
  incrementStep: string;
  baseCurrency: string;
  status?: string;
  endPrice?: string;
  sellerType?: string;
  isSold?: boolean;
  location?: string;
  categoryPath?: string;
  product: Product;
  invites: Invite[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  priceType: string;
  destinationPort: string;
  orderQuantity: number;
  images: string[];
  attributes: Record<string, string>;
}

interface Invite {
  inviteId: number;
  inviteStatus: string;
  nickname: string;
  manufacturerId?: number;
}

interface Bid {
  auctionId: number;
  nickname: string;
  amount: number;
  timestamp: string;
  message?: string;
  price?: string;
  date?: string;
}

//------------------------------------------------------------------
// Theme – brand colors, fonts, etc.
//------------------------------------------------------------------
const customTheme = createTheme({
    palette: {
      primary: { main: '#FFCC00' }, // brand highlight (yellow)
      secondary: { main: '#6A5BFF' }, // CTA (purple)
    text: {
      primary: '#333333',
      secondary: '#6E6E76',
    },
    success: { main: '#0E8345' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: 32, fontWeight: 700 },
    h2: { fontSize: 24, fontWeight: 700 },
    body1: { fontSize: 16 },
    body2: { fontSize: 14 },
  },
    shape: {
      borderRadius: 4, // Card corners 4px
  },
});

//------------------------------------------------------------------
// Additional styles (flip clock, pulse, etc.)
//------------------------------------------------------------------
const extraStyles = `
/* Flip clock basamak */
.flip-clock{position:relative;perspective:1000px;width:64px;height:80px;margin:0 4px;display:inline-block}
.flip-clock .upper,.flip-clock .lower{width:100%;height:50%;overflow:hidden;background:#222;color:#FFCC00;font-size:40px;font-weight:bold;display:flex;align-items:center;justify-content:center;position:absolute;left:0}
.flip-clock .upper{top:0;border-bottom:1px solid #333;border-top-left-radius:4px;border-top-right-radius:4px}
.flip-clock .lower{bottom:0;border-top:1px solid #333;border-bottom-left-radius:4px;border-bottom-right-radius:4px}
.flip-clock .flip{animation:flip 0.7s linear forwards;transform-origin:center bottom}
@keyframes flip{0%{transform:rotateX(0deg)}100%{transform:rotateX(-90deg)}}
/* Pulse animasyonu  <10 sn */
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
/* Toast fadeInChat */
@keyframes fadeInChat{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

//------------------------------------------------------------------
// FlipCard & Countdown3D components
//------------------------------------------------------------------
function FlipCard({ digit }: { digit: string }) {
  const [current, setCurrent] = useState(digit);
  const [flip, setFlip] = useState(false);
   
  useEffect(() => {
    if (digit !== current) {
      setFlip(true);
      setTimeout(() => {
        setCurrent(digit);
        setFlip(false);
      }, 700);
    }
  }, [digit, current]);

  return (
    <Box className="flip-clock">
      <Box className="upper">{current}</Box>
      <Box className="lower">{digit}</Box>
      {flip && <Box className="upper flip">{current}</Box>}
    </Box>
  );
}

function Countdown3D({ timeText }: { timeText: string }) {
  const parts = timeText.split('');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {parts.map((ch, i) =>
        ch === ':' ? (
          <Typography key={i} sx={{ mx: 0.5, fontSize: 32, fontWeight: 'bold', color: '#333' }}>
            :
          </Typography>
        ) : (
          <FlipCard key={i} digit={ch} />
        )
      )}
    </Box>
  );
}

//------------------------------------------------------------------
// SimpleCountdown – pulse & sticky behaviour
//------------------------------------------------------------------
function SimpleCountdown({ endTime }: { endTime: string }) {
  const [time, setTime] = useState('');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!endTime) return;
    const target = parseIsoAsLocal(endTime);   // 11:48 (yerel)

    const tick = () => {
      const diff = Math.max(target - Date.now(), 0);
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTime(` ${mins} : ${secs} `);
      setPulse(diff <= 10_000); // <10 sn ise pulse
    };

    tick();
    const iv = setInterval(tick, 1_000);
    return () => clearInterval(iv);
  }, [endTime]);

  return (
    <Box
      sx={{
        bgcolor: '#000',
        color: '#FFCC00',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        animation: pulse ? 'pulse 0.2s ease-in-out infinite' : 'none',
      }}
    >
      <Typography variant="body1" fontWeight={900} sx={{ fontSize: 30 }}>
        {time}
      </Typography>
    </Box>
  );
}

//------------------------------------------------------------------
// Header – sticky search bar
//------------------------------------------------------------------
function Header({ nickname }: { nickname?: string }) {
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ backdropFilter: 'blur(6px)' }}>
      <Toolbar sx={{ gap: 2 }}>
        {/* Search */}
        <Box sx={{ position: 'relative', flexGrow: 1 }}>
  
        </Box>

            Temporary Username{nickname && (
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {nickname}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

//------------------------------------------------------------------
// Footer – basit footer
//------------------------------------------------------------------
function Footer() {
  return (
    <Paper
      component="footer"
      square
      elevation={0}
      sx={{ mt: 6, py: 3, textAlign: 'center', backgroundColor: '#1A1D23' }}
    >
      <Typography variant="body2" color="#fff" fontWeight={600}>
        © {new Date().getFullYear()} Demaxtore Auction Company — All Rights Reserved
      </Typography>
    </Paper>
  );
}

//------------------------------------------------------------------
// Main page component
//------------------------------------------------------------------
export default function AuctionPage() {
  const { id } = useParams() as { id: string };
  const auctionId = Number(id);
  const router = useRouter();

  const socketRef = useRef<typeof Socket | null>(null);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [autoBid, setAutoBid] = useState(false);
  const [autoBidLimit, setAutoBidLimit] = useState<number | null>(null);
  const [autoBidInput, setAutoBidInput] = useState('');
  const [openAutoBid, setOpenAutoBid] = useState(false);
  const lastAutoBid = useRef<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'warning' }>({ open: false, msg: '', type: 'success' });
  const warningShown = useRef(false);
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [winnerName, setWinnerName] = useState('');
   

  const fetchAuction = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get<{ auction: Auction }>(`/auctions/${auctionId}`);
      const raw = data.auction;
      setAuction(raw);
      setCurrentPrice(parseFloat(raw.lastOffer ?? raw.startPrice));

      // Bid history
      interface BidResponse {
        auction: Array<{ nickname: string; price: string; date: string }>;
      }
      try {
        const bidResp = await axiosClient.get<BidResponse>(`/auctions/placeBid/${auctionId}`);
        const arr: Bid[] = (bidResp.data.auction || [])
          .map((b) => ({
            auctionId,
            nickname: b.nickname,
            amount: parseFloat(String(b.price).replace(/[^0-9.]/g, '')),
            timestamp: b.date,
            price: b.price,
            date: b.date,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setBids(arr);
        if (arr.length > 0) {
          const last = arr[arr.length - 1];
          lastAutoBid.current = last.amount;
        }
      } catch (e) {
        console.error('fetch bids', e);
      }

const now   = Date.now();
const start = parseIsoAsLocal(raw.startTime);     // 10:12 yerel
const end   = parseIsoAsLocal(raw.endTime);       // 11:48 yerel
setIsActive(now >= start && now <= end);
console.log('isActive?', new Date(now), new Date(start), new Date(end),
            now >= start && now <= end);
setIsActive(now >= start && now <= end);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Auction couldn\'t be loaded');
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  //----------------------------------------------------------------
  // Socket
  //----------------------------------------------------------------
  useEffect(() => {
    if (!auction) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.demaxtore.com';
    const socket = io(SOCKET_URL, { path: '/socket.io' });
    socketRef.current = socket as unknown as typeof Socket;

    socket.on('connect', () => {
      socket.emit('joinAuction', { auctionId, role: 'customer' });
    });

    socket.on('bidUpdated', (payload: Bid) => {
      if (payload.auctionId !== auctionId) return;
      setBids((prev) => {
        const arr = [payload, ...prev];
        setHighlightIndex(0);
        setTimeout(() => setHighlightIndex(null), 1000);
        return arr;
      });
      setCurrentPrice(payload.amount);
      setToast({ open: true, msg: 'New bid received', type: 'success' });
    });

    return () => {
      socket.disconnect();
    };  }, [auction, auctionId]);

  //----------------------------------------------------------------
  // Auto‑bid
  //----------------------------------------------------------------
  useEffect(() => {
    if (!autoBid || !auction || autoBidLimit === null) return;
    const last = bids[0];
    if (!last || last.nickname === auction.your_nickname) return;

    const step = parseFloat(auction.incrementStep || '1');
    const dir = auction.sortDirection || 'asc';
    if (dir === 'asc') {
      const max = Math.min(parseFloat(auction.endPrice || 'Infinity'), autoBidLimit);
      const next = last.amount + step;
      if (next > max || next <= lastAutoBid.current) return;
      lastAutoBid.current = next;
      placeBid(next);
    } else {
      const min = Math.max(parseFloat(auction.endPrice || '-Infinity'), autoBidLimit);
      const next = last.amount - step;
      if (next < min || next >= lastAutoBid.current) return;
      lastAutoBid.current = next;
      placeBid(next);
    }
  }, [bids, autoBid, autoBidLimit, auction]);

  // Handle auction end
  useEffect(() => {
    if (!auction) return;
    const end = parseIsoAsLocal(auction.endTime);
    const diff = end - Date.now();
    if (diff <= 0) {
      setIsActive(false);
      setWinnerName(bids[0]?.nickname || 'No bids');
      setWinnerOpen(true);
      return;
    }
    const t = setTimeout(() => {
      setIsActive(false);
      setWinnerName(bids[0]?.nickname || 'No bids');
      setWinnerOpen(true);
    }, diff);
    return () => clearTimeout(t);
  }, [auction, bids]);

  // Warn when 15 minutes remain
  useEffect(() => {
    if (!auction || warningShown.current) return;
    const end = parseIsoAsLocal(auction.endTime);
    const warnDiff = end - Date.now() - 15 * 60 * 1000;
    if (warnDiff <= 0) {
      setToast({ open: true, msg: '15 minutes left until the auction ends', type: 'warning' });
      warningShown.current = true;
      return;
    }
    const t = setTimeout(() => {
      setToast({ open: true, msg: '15 minutes left until the auction ends', type: 'warning' });
      warningShown.current = true;
    }, warnDiff);
    return () => clearTimeout(t);
  }, [auction]);

  //----------------------------------------------------------------
  // placeBid
  //----------------------------------------------------------------
  const placeBid = async (amount: number) => {
    if (!auction) return;

    const start = parseFloat(auction.startPrice || '0');
    const end = parseFloat(auction.endPrice || 'Infinity');
    const step = parseFloat(auction.incrementStep || '1');
    const dir = auction.sortDirection || 'asc';

    if (dir === 'asc') {
      if (amount < start || amount > end) {
        setToast({ open: true, msg: 'Bid outside range', type: 'error' });
        return;
      }
      if (amount <= currentPrice) {
        setToast({ open: true, msg: 'Please bid higher', type: 'error' });
        return;
      }
      if ((amount - start) % step !== 0 || amount - currentPrice < step) {
        setToast({ open: true, msg: `Minimum increment ${step}`, type: 'error' });
        return;
      }
    } else {
      if (amount > start || amount < end) {
        setToast({ open: true, msg: 'Bid outside range', type: 'error' });
        return;
      }
      if (amount >= currentPrice) {
        setToast({ open: true, msg: 'Please bid lower', type: 'error' });
        return;
      }
      if ((start - amount) % step !== 0 || currentPrice - amount < step) {
        setToast({ open: true, msg: `Minimum decrement ${step}`, type: 'error' });
        return;
      }
    }

    try {
      await axiosClient.post('/auctions/placeBid', {
        auctionId,
        amount,
        userId: JSON.parse(localStorage.getItem('auth-data') || '{}').user?.id,
        userCurrency: auction.baseCurrency,
      });
      const nickname = auction.your_nickname ||
        JSON.parse(localStorage.getItem('auth-data') || '{}').user?.nickname ||
        'You';
      const newBid: Bid = {
        auctionId,
        nickname,
        amount,
        timestamp: new Date().toISOString(),
        price: `${amount.toLocaleString()} ${auction.baseCurrency}`,
        date: new Date().toISOString(),
      };
      setBids((prev) => {
        const arr = [newBid, ...prev];
        setHighlightIndex(0);
        setTimeout(() => setHighlightIndex(null), 1000);
        return arr;
      });
      setCurrentPrice(amount);
      setToast({ open: true, msg: 'Bid submitted', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: 'Bid error', type: 'error' });
    }
  };

  //----------------------------------------------------------------
  // UI Helpers
  //----------------------------------------------------------------
  const handleChangeTab = (_: SyntheticEvent, v: number) => setActiveTab(v);

  const step = parseFloat(auction?.incrementStep || '1');
  const endLimit = parseFloat(auction?.endPrice || 'Infinity');
  const dir = auction?.sortDirection || 'asc';
  const nextPrices = dir === 'asc'
    ? (step === 1
        ? [1, 5, 10, 20, 50].map((inc) => Math.min(currentPrice + inc, endLimit))
        : [1, 2, 3].map((mult) => Math.min(currentPrice + step * mult, endLimit)))
    : (step === 1
        ? [1, 5, 10, 20, 50].map((dec) => Math.max(currentPrice - dec, endLimit))
        : [1, 2, 3].map((mult) => Math.max(currentPrice - step * mult, endLimit)));

  const handleWinnerClose = () => {
    setWinnerOpen(false);
    router.push('/dashboard');
  };

  //----------------------------------------------------------------
  // Left Card
  //----------------------------------------------------------------
  const LeftCard = () => (
    <Card elevation={2} sx={{ p: 2 }}>
      {/* Kategori badge */}
      {auction?.categoryPath && (
        <Box
          sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'primary.main', px: 1, py: 0.25, borderRadius: 1 }}
        >
          <Typography variant="caption" fontWeight={600}>
            {auction.categoryPath}
          </Typography>
        </Box>
      )}

      {/* Title & location */}
      <Typography variant="h1" gutterBottom>
        {auction?.title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {auction?.location && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {auction.location}
        </Typography>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: 2 },
          mb: 1,
        }}
      >
        <Tab label="Product Features" />
        <Tab label="Description" />
        <Tab label="Technical Form" />
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {/* Tab content */}
      {activeTab === 0 && (
        <Stack spacing={1}>
          {Object.entries(auction?.product?.attributes || {}).map(([k, v]) => (
            <Stack
              key={k}
              direction="row"
              spacing={1}
              sx={{ p: 1, bgcolor: '#FAFAFA', borderRadius: 1 }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                {k}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {v}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
      {activeTab === 1 && (
        <Typography variant="body2" whiteSpace="pre-wrap">
          {auction?.product?.description}
        </Typography>
      )}
      {activeTab === 2 && (
        <Stack spacing={1}>
          <Typography variant="body2">Price Type: {auction?.product?.priceType}</Typography>
          <Typography variant="body2">Destination Port: {auction?.product?.destinationPort}</Typography>
          <Typography variant="body2">Order Quantity: {auction?.product?.orderQuantity}</Typography>
        </Stack>
      )}

      {/* Image */}
      {auction?.product?.images?.[0] ? (
        <Box
          component="img"
          src={auction.product.images[0]}
          sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2, mt: 2 }}
          alt="Product image"
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            aspectRatio: '4 / 3',
            background: 'linear-gradient(135deg, #f2f2f2 0%, #e6e6e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Photo not available
          </Typography>
        </Box>
      )}
    </Card>
  );

  //----------------------------------------------------------------
  // Right Card
  //----------------------------------------------------------------
  const RightCard = () => (
    <Card elevation={2} sx={{ p: 2, position: 'relative' }}>
      {/* Sticky countdown */}
      <Box sx={{ position: 'sticky', top: 16, ml: 'auto', width: 'fit-content' }}>
        {auction && <SimpleCountdown endTime={auction.endTime} />}
      </Box>

      {/* Product ID & start price */}
      <Stack spacing={1} sx={{ mt: 1 }}>
        <Typography variant="h2">Product ID: {auction?.id}</Typography>
        <Divider />
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Starting Price
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {parseFloat(auction?.startPrice || '0').toLocaleString()} {auction?.baseCurrency}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Current Bid
          </Typography>
          <Typography variant="h4" color="success.main" fontWeight={700}>
            {currentPrice.toLocaleString()} {auction?.baseCurrency}
          </Typography>
        </Stack>
      </Stack>

      {/* Quick increment buttons */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ my: 2 }}>
        {nextPrices.map((p, idx) => (
          <Chip
            key={idx}
            label={dir === 'asc'
              ? `+${(p - currentPrice).toLocaleString()}`
              : `-${(currentPrice - p).toLocaleString()}`}
            color="primary"
            clickable
            onClick={() => placeBid(p)}
            sx={{ borderRadius: 9999, fontWeight: 600 }}
          />
        ))}
      </Stack>

      {/* Manual bid */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="Manual Bid"
          size="small"
          type="number"
          defaultValue={nextPrices[0]}
          sx={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && placeBid(Number((e.target as HTMLInputElement).value))}
        />
        <Button
          variant="contained"
          color="secondary"
          sx={{ fontWeight: 700, px: 3 }}
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('input[placeholder="Manual Bid"]');
            if (input) placeBid(Number(input.value));
          }}
        >
          PLACE BID
        </Button>
      </Stack>

      {/* Auto‑bid toggle */}
      <Button
        variant="outlined"
        color={autoBid ? 'error' : 'inherit'}
        fullWidth
        sx={{ borderColor: autoBid ? 'error.main' : '#B00020', color: autoBid ? 'error.main' : '#B00020', mb: 2, fontWeight: 600 }}
        onClick={() => {
          if (autoBid) {
            setAutoBid(false);
          } else {
            setOpenAutoBid(true);
          }
        }}
      >
        {autoBid ? 'Stop Auto Bid' : 'Enable Auto Bid Mode'}
      </Button>

      <Dialog
        open={openAutoBid}
        disableEscapeKeyDown
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') {
            setOpenAutoBid(false);
          }
        }}
      >
        <DialogTitle>Auto Bid Limit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Max Bid"
            type="number"
            fullWidth
            value={autoBidInput}
            onChange={(e) => setAutoBidInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAutoBid(false); setAutoBidInput(''); }}>Cancel</Button>
          <Button
            onClick={() => {
              setOpenAutoBid(false);
              const val = parseFloat(autoBidInput);
              if (!isNaN(val)) setAutoBidLimit(val);
              setAutoBid(true);
              setAutoBidInput('');
            }}
            variant="contained"
          >
            Start
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bid history */}
      <Typography variant="h2" sx={{ mb: 1 }}>
        Bid History
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
        {bids.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No bids yet
          </Typography>
        )}
        {bids.map((b, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              p: 1,
              borderRadius: 1,
              '&:hover': { backgroundColor: '#F5F5F5' },
              backgroundColor: highlightIndex === i ? 'rgba(255, 204, 0, 0.2)' : 'transparent',
              animation: highlightIndex === i ? 'fadeInChat 0.5s' : 'none',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1A1D23', fontSize: 12 }}>
              {b.nickname?.charAt(0).toUpperCase()}
            </Avatar>
            <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {b.nickname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(b.price || `${b.amount.toLocaleString()} ${auction?.baseCurrency}`)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {dayjs(b.date || b.timestamp).fromNow()}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Card>
  );

  //----------------------------------------------------------------
  // Render states (loading, error, inactive)
  //----------------------------------------------------------------
  if (loading) {
    return (
      <ThemeProvider theme={customTheme}>
        <style>{extraStyles}</style>
        <Header />
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <CircularProgress />
        </Stack>
      </ThemeProvider>
    );
  }
  if (error || !auction) {
    return (
      <ThemeProvider theme={customTheme}>
        <style>{extraStyles}</style>
        <Header />
        <Typography sx={{ mt: 8, textAlign: 'center' }} color="error">
          {error || 'Auction not found'}
        </Typography>
      </ThemeProvider>
    );
  }
  if (!isActive) {
    return (
      <ThemeProvider theme={customTheme}>
        <style>{extraStyles}</style>
        <Header nickname={auction.your_nickname} />
        <Typography sx={{ mt: 8, textAlign: 'center' }}>
          Auction is not active.
        </Typography>
        <Dialog open={winnerOpen} onClose={handleWinnerClose}>
          <DialogTitle>Auction Ended</DialogTitle>
          <DialogContent>
            <Typography>The winner is {winnerName}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleWinnerClose} variant="contained">OK</Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }

  //----------------------------------------------------------------
  // Main render
  //----------------------------------------------------------------
  return (
    <ThemeProvider theme={customTheme}>
      <style>{extraStyles}</style>

      <Header nickname={auction.your_nickname} />

<Box sx={{ backgroundColor:'#FAFAFA', minHeight:'100vh', py:3, px:{ xs:1, md:0 } }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={8} lg={8}>
            <LeftCard />
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            <RightCard />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Card>
              <CardHeader title="API Response" />
              <CardContent>
                <pre style={{ overflowX: 'auto' }}>{JSON.stringify(auction, null, 2)}</pre>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Footer />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
