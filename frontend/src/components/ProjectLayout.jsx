// ──────────────────────────────────────────────────────────────
// src/components/ProjectLayout.jsx
// ──────────────────────────────────────────────────────────────
import React from 'react';
import {Outlet} from 'react-router-dom';
import {Box} from '@mui/material';

export default function ProjectLayout() {
    return (
        <Box                    /* full height below Header + inside Shell */
            sx={{flex: 1, display: 'flex', flexDirection: 'column'}}
        >
            <Box                  /* page body */
                component="section"
                sx={{
                    flexGrow: 1,
                    width: '100%',            /* always span 100 % */
                    maxWidth: {
                        xs: '100%',             /* no capping on xs / sm */
                        md: 'calc(100vw - 240px)', /* leave room for the sidebar ≥ md */
                        xl: '1800px',           /* ← Updated to match page maxWidth */
                    },
                    p: 0, // ← Remove padding since pages handle their own padding
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    mt:-3,
                }}
            >
                <Outlet/>
            </Box>
        </Box>
    );
}
