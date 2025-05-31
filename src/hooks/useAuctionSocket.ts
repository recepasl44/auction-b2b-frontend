import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import io from 'socket.io-client';

interface Bid {
    nickname: ReactNode;
    auctionId: number;
    userId: number;
    amount: number;
    timestamp: string;
}

export function useAuctionSocket(
    auctionId: number,
    userId: number,
    role: string = 'customer'
) {
    // Treat socket as any to avoid missing type export
    const socketRef = useRef<any>(null);
    const [bids, setBids] = useState<Bid[]>([]);

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;
        const socket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('joinAuction', { auctionId, userId, role });
        });

        socket.on('bidPlaced', (bid: Bid) => {
            if (bid.auctionId === auctionId) {
                setBids((prev) => [...prev, bid]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [auctionId, userId, role]);

    const placeBid = useCallback((amount: number) => {
        socketRef.current?.emit('placeBid', { auctionId, userId, amount });
    }, [auctionId, userId]);

    return { bids, placeBid };
}
