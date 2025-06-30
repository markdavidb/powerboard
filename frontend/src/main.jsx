// ──────────────────────────────────────────────────────────────
// src/main.jsx
// ──────────────────────────────────────────────────────────────
import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM                                from 'react-dom/client';
import { BrowserRouter }                       from 'react-router-dom';
import { Auth0Provider, useAuth0 }             from '@auth0/auth0-react';
import { ThemeProvider, CssBaseline }          from '@mui/material';

import App                     from './App';
import NotificationProvider    from './components/NotificationProvider';
import baseTheme               from './theme';                // ← YOUR dark theme
import ColorModeContext        from './themes/ColorModeContext';

// ─── Auth0 settings ───────────────────────────────────────────
const auth0Config = {
    domain      : import.meta.env.VITE_AUTH0_DOMAIN,
    clientId    : import.meta.env.VITE_AUTH0_CLIENT_ID,
    audience    : import.meta.env.VITE_AUTH0_AUDIENCE,
    scope       : import.meta.env.VITE_AUTH0_SCOPE,
    redirectUri : `${window.location.origin}/login`,
};

// expose getToken at window level (unchanged)
function Auth0TokenSetter() {
    const { getAccessTokenSilently } = useAuth0();
    useEffect(() => { window.getAuth0Token = getAccessTokenSilently; },
        [getAccessTokenSilently]);
    return null;
}

// ─── Root component ───────────────────────────────────────────
function Root() {
    // start with whatever mode the theme already has
    const [mode, setMode] = useState(baseTheme.palette.mode ?? 'dark');

    // ‼️   we ONLY flip palette.mode – everything else comes from theme.js
    const theme = useMemo(
        () => ({
            ...baseTheme,
            palette: { ...baseTheme.palette, mode },
        }),
        [mode],
    );

    // callback injected into ColorModeContext
    const colorMode = useMemo(
        () => ({ toggleColorMode: () =>
                setMode(prev => (prev === 'light' ? 'dark' : 'light')) }),
        [],
    );

    return (
        <Auth0Provider
            domain        ={auth0Config.domain}
            clientId      ={auth0Config.clientId}
            cacheLocation ="localstorage"
            useRefreshTokens
            authorizationParams={{
                audience     : auth0Config.audience,
                scope        : auth0Config.scope,
                redirect_uri : auth0Config.redirectUri,
            }}
        >
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>

                        {/* keep WS connection stable */}
                        <NotificationProvider>
                            <Auth0TokenSetter />
                            <React.StrictMode>
                                <App />
                            </React.StrictMode>
                        </NotificationProvider>

                    </BrowserRouter>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </Auth0Provider>
    );
}

// ─── mount ────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
