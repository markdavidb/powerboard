// src/hooks/useRealtimeGateway.js
import { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Opens exactly ONE WebSocket pointing at /ws on the same host that served the SPA
 * – Adds the Auth0 access‑token as ?token=… (gateway verifies it)
 * – Auto‑reconnects every 3s until success
 * – Keeps the latest onMsg handler without reopening the socket
 */
export default function useRealtimeGateway(onMsg) {
    const { getAccessTokenSilently } = useAuth0();

    const wsRef = useRef(null);
    const handlerRef = useRef(onMsg);

    // Keep the ref updated so we always call the latest callback
    useEffect(() => {
        handlerRef.current = onMsg;
    }, [onMsg]);

    useEffect(() => {
        let mounted = true;
        let retryTID = null;

        async function connect() {
            if (!mounted) return;

            try {
                // 1) Retrieve JWT from Auth0 silently
                const token = await getAccessTokenSilently();

                // 2) Build ws / wss URL that matches the page host (no trailing slash)
                const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                const wsUrl = `${protocol}://${window.location.host}/ws?token=${encodeURIComponent(token)}`;

                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.debug('[WS] ✅ connected');
                };

                ws.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        handlerRef.current(data);
                    } catch (err) {
                        console.warn('[WS] ⚠️ non‑JSON message', e.data);
                    }
                };

                ws.onerror = () => ws.close();

                ws.onclose = () => {
                    if (!mounted) return;
                    console.warn('[WS] 🔄 closed – reconnecting in 3 s');
                    retryTID = setTimeout(connect, 3000);
                };
            } catch (err) {
                console.error('[WS] ❌ failed to open – retry in 3 s', err);
                retryTID = setTimeout(connect, 3000);
            }
        }

        connect();

        return () => {
            mounted = false;
            clearTimeout(retryTID);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [getAccessTokenSilently]); // runs once per login session
}
