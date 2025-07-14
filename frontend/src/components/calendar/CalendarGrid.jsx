// src/components/CalendarGrid.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { format, isSameMonth } from 'date-fns';
import CalendarCell from './CalendarCell';
import { buildWeeks } from './calendarUtils';

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ monthStart, dueMap, onSelect }) {
    const weeks = buildWeeks(monthStart);

    return (
        <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflow: 'hidden'
        }}>
            {/* Day Headers */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: { xs: 0.5, md: 1 },
                mb: 1,
            }}>
                {dayHeaders.map((day) => (
                    <Box
                        key={day}
                        sx={{
                            textAlign: 'center',
                            py: 1,
                            background: 'rgba(80,80,120,0.3)',
                            borderRadius: 1,
                            border: '1px solid rgba(255,255,255,0.15)',
                        }}
                    >
                        <Typography sx={{
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {day}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Calendar Grid */}
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: `repeat(${weeks.length}, minmax(240px, 1fr))`, // Increased from 200px to 240px
                    gap: { xs: 0.5, md: 1 },
                    overflow: 'auto',
                    minHeight: 0, // Important for grid to work with flex parent
                    // Custom scrollbar
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(108,99,255,0.4)',
                        borderRadius: '8px',
                        border: '2px solid transparent',
                        backgroundClip: 'content-box',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(108,99,255,0.7)',
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(108,99,255,0.4) transparent',
                }}
            >
                {weeks.flat().map((day) => {
                    const iso = format(day, 'yyyy-MM-dd');
                    const items = dueMap[iso] || [];
                    const inMonth = isSameMonth(day, monthStart);

                    // If not in current month, render an "empty" placeholder
                    if (!inMonth) {
                        return (
                            <Box
                                key={iso}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: 240, // Match the new grid height
                                    background: 'rgba(60,60,90,0.2)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography sx={{
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    {format(day, 'd')}
                                </Typography>
                            </Box>
                        );
                    }

                    return <CalendarCell key={iso} day={day} items={items} onSelect={onSelect} />;
                })}
            </Box>
        </Box>
    );
}
