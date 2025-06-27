// src/components/DueSoonListCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export default function DueSoonListCard({ title, items, renderRight }) {
    return (
        <Card sx={{
            background: 'rgba(24,24,30,0.80)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
            borderRadius: 3,
        }}>
            <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
                {items.map((it, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1,
                            borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        }}
                    >
                        <Typography variant="body1">{it.name}</Typography>
                        {renderRight && renderRight(it)}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}
