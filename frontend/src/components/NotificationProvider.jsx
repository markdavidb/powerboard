import React, { useCallback } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import useRealtimeGateway from '../hooks/useRealtimeGateway';

function LiveToasts() {
    const { enqueueSnackbar } = useSnackbar();

    // stable across renders
    const handleMsg = useCallback(msg => {
        if (msg.type === 'notification') {
            enqueueSnackbar(msg.message, { variant: 'info' });
        }
    }, [enqueueSnackbar]);

    useRealtimeGateway(handleMsg);
    return null;
}

export default function NotificationProvider({ children }) {
    return (
        <SnackbarProvider
            maxSnack={3}
            dense
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={4000}
            iconVariant={{ success: '✅', error: '❌', warning: '⚠️', info: '🔔' }}
        >
            {children}
            <LiveToasts />
        </SnackbarProvider>
    );
}
