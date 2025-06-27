// src/api/useMyId.js
import { useRef, useEffect } from 'react';
import {API} from './axios';

/**
 * React hook ⇒ returns the numeric `id` stored in your own /users/me.
 * It calls the endpoint only once and caches the value.
 */
export function useMyId() {
    const idRef = useRef(null);

    useEffect(() => {
        if (idRef.current !== null) return;   // already fetched
        (async () => {
            const { data } = await API.get('/users/me'); // { id: 7, username: 'alice', … }
            idRef.current = data.id;
        })();
    }, []);

    return idRef.current; // may be null until loaded
}
