// src/components/CalendarShell.jsx

import React, { useState, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { addMonths, subMonths } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import DayDetailsModal from './DayDetailsModal';

export default function CalendarShell({
                                          useDataHook,
                                          onProjectClick,
                                          onEpicClick,
                                          onTaskSaved,
                                      }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const containerRef = useRef(null);

    const [dueMap, reload, loading] = useDataHook(currentDate);

    return (
            <Box
                ref={containerRef}
                id="main-box"
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px' },
                    height: '88vh', // strict height, exactly like your project page
                    mx: 'auto',
                    mt: { xs: 1, md: -0 },
                    boxSizing: 'border-box',
                    backdropFilter: 'blur(18px)',
                    background: theme => theme.palette.background.default,  // ← use your theme
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: loading ? 'center' : 'flex-start',
                    alignItems: loading ? 'center' : 'stretch',
                    p: { xs: 1, sm: 2, md: 4 }, // exact padding as project page
                    // Scrollbar theme inside each cell in case there are > MAX_ITEMS
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                        width: '6px',
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
                {loading ? (
                    <CircularProgress sx={{ color: '#6C63FF' }} />
                ) : (
                    <>
                        <CalendarHeader
                            date={currentDate}
                            onPrev={() => setCurrentDate((d) => subMonths(d, 1))}
                            onNext={() => setCurrentDate((d) => addMonths(d, 1))}
                        />
                        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', mt: 2 }}>
                            <CalendarGrid
                                monthStart={currentDate}
                                dueMap={dueMap}
                                onSelect={(date, items) => setSelectedDay({ date, items })}
                            />
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Project', color: '#ff007f' },
                                { label: 'Epic', color: '#f7b32b' },
                                { label: 'Task', color: '#1e90ff' },
                            ].map((item) => (
                                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            backgroundColor: item.color,
                                            boxShadow: '0 0 4px rgba(255,255,255,0.3)',
                                        }}
                                    />
                                    <Box component="span" sx={{ color: '#eee', fontSize: 14 }}>
                                        {item.label}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}

            {!loading && selectedDay && (
                <DayDetailsModal
                    open
                    date={selectedDay.date}
                    items={selectedDay.items}
                    container={containerRef.current}
                    onClose={() => setSelectedDay(null)}
                    onProjectClick={onProjectClick}
                    onEpicClick={onEpicClick}
                    onTaskSelect={(updated) => {
                        reload();
                        onTaskSaved?.(updated);
                    }}
                />
            )}
        </Box>
    );
}
