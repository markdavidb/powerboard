// src/components/Hero.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function Hero({ onLogin }) {
    return (
        <Box
            component="section"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                px: 2,
            }}
        >
            <Typography
                variant="h1"
                component="h1"
                sx={{
                    color: '#f4f5fa',
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '5rem' },
                    lineHeight: 1.1,
                    mb: 2,
                }}
            >
                PowerBoard
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    maxWidth: 600,
                    mb: 4,
                }}
            >
                Organize your team. Track your work. Get more done.
            </Typography>
            <Button
                variant="contained"
                onClick={onLogin}
                sx={{
                    backgroundColor: '#fff',
                    color: '#23243a',
                    px: 5,
                    py: 1.5,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                        backgroundColor: '#f0f0f0',
                    },
                }}
            >
                Login with Auth0
            </Button>
        </Box>
    );
}