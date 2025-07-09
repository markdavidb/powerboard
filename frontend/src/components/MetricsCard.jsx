import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';

export default function MetricsCard({
                                        title,
                                        total,
                                        done,
                                        icon = null,     // Optional, for visual variety
                                    }) {
    // Safety for zero-total
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <Card
            sx={{
                background: 'rgba(24,24,30,0.80)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
                borderRadius: 3,
                height: { xs: 140, sm: 150 },
                minWidth: { xs: 200, sm: 250 },
                width: '100%',
                maxWidth: 400,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
            }}
            elevation={0}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                >
                    {title}
                </Typography>
                {icon}
            </Box>

            <Typography
                variant="h3"
                sx={{
                    fontWeight: 700,
                    color: '#fff',
                    mb: 0.2,
                    lineHeight: 1,
                    fontSize: { xs: '2rem', sm: '3rem' }
                }}
            >
                {total}
            </Typography>

            <Box sx={{ width: '100%', mt: 0.5, mb: 0.3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: { xs: 12, sm: 13 },
                    color: '#b1b1b6'
                }}>
                    <span>{done}/{total} done</span>
                    <span>{pct}%</span>
                </Box>
                <Box
                    sx={{
                        height: 8,
                        width: '100%',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderRadius: 99,
                        overflow: 'hidden',
                        mt: 0.3,
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg,#818cf8 10%,#6366f1 90%)',
                            borderRadius: 99,
                            transition: 'width .4s',
                        }}
                    />
                </Box>
            </Box>
        </Card>
    );
}
