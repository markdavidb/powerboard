// src/components/CalendarGrid.jsx
import React from 'react';
import { Box } from '@mui/material';
import { format, isSameMonth } from 'date-fns';
import CalendarCell from './CalendarCell';
import { buildWeeks } from './calendarUtils';

export default function CalendarGrid({ monthStart, dueMap, onSelect }) {
    const weeks = buildWeeks(monthStart);

    return (
        <Box
            sx={{
                // A tiny top margin so the first row of cells sits just under the header
                mt: 1,
                width: '100%',
                display: 'grid',
                // 7 equal columns, minimum 80px each, flex if extra space
                gridTemplateColumns: 'repeat(7, minmax(80px, 1fr))',
                // Tight gap so cells sit nearly flush
                gap: { xs: 0.5, md: 1 },
                mx: 'auto',
                outline: 'none',
                p:1.5,
            }}
        >
            {weeks.flat().map((day) => {
                const iso = format(day, 'yyyy-MM-dd');
                const items = dueMap[iso] || [];
                const inMonth = isSameMonth(day, monthStart);

                // If not in current month, render an “empty” placeholder with the same aspect ratio:
                if (!inMonth) {
                    return (
                        <Box
                            key={iso}
                            sx={{
                                width: '100%',
                                aspectRatio: '1 / 1', // keep same square shape as CalendarCell
                                minWidth: 80,
                                minHeight: 80,
                                maxWidth: 210,
                                maxHeight: 210,
                                background: 'transparent',
                                borderRadius: 3,
                            }}
                            tabIndex={-1}
                        />
                    );
                }

                return <CalendarCell key={iso} day={day} items={items} onSelect={onSelect} />;
            })}
        </Box>
    );
}
