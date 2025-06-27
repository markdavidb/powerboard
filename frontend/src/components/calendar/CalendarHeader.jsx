// src/pages/MainCalendar/CalendarHeader.jsx
import React from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import {format} from 'date-fns';

export default function CalendarHeader({date, onPrev, onNext}) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4,
        }}>
            <IconButton onClick={onPrev}><ArrowLeft/></IconButton>
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                    background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {format(date, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={onNext}><ArrowRight/></IconButton>
        </Box>
    );
}
