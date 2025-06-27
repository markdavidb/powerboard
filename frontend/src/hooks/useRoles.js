// src/hooks/useRoles.js
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

const NAMESPACE  = 'https://powerboard.local/';
const CLAIM_KEY  = `${NAMESPACE}roles`;

/* ──────────────────────────────────────────────────────────── */
/*  Tiny JWT decoder                                            */
/* ──────────────────────────────────────────────────────────── */
function decodeJwt(token) {
    try {
        const payload = token.split('.')[1];
        let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        b64     = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
        return JSON.parse(atob(b64));
    } catch {
        return {};
    }
}

/* ──────────────────────────────────────────────────────────── */
/*  Main hook                                                   */
/* ──────────────────────────────────────────────────────────── */
export default function useRoles() {
    const { user, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

    /** `null`  → still loading
     *  `Array` → roles loaded (may be empty) */
    const [roles, setRoles] = useState(null);

    /* 1️⃣  Read roles from the **ID token** (available on first render) */
    useEffect(() => {
        if (!authLoading && user && Array.isArray(user[CLAIM_KEY])) {
            setRoles(user[CLAIM_KEY]);
        }
    }, [authLoading, user]);

    /* 2️⃣  Fallback: silently grab the **access token** and decode roles */
    useEffect(() => {
        if (!authLoading && roles === null) {
            (async () => {
                try {
                    const token   = await getAccessTokenSilently({
                        audience: import.meta.env.VITE_PROJECT_API_AUD,
                        scope: '',
                    });
                    const decoded = decodeJwt(token);
                    if (Array.isArray(decoded[CLAIM_KEY])) {
                        setRoles(decoded[CLAIM_KEY]);
                    } else {
                        setRoles([]);                    // no roles claim → empty array
                    }
                } catch {
                    setRoles([]);                      // silently degrade
                }
            })();
        }
    }, [authLoading, roles, getAccessTokenSilently]);

    /* 3️⃣  Derived state */
    const ready    = roles !== null;           // roles finished loading
    const isAdmin  = ready && roles.includes('platform_admin');

    return { roles: roles ?? [], isAdmin, ready };
}
