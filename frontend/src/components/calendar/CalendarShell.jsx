// src/components/CalendarShell.jsx

import React, { useState, useRef } from 'react';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { addMonths, subMonths } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import ResponsiveCalendarGrid from './ResponsiveCalendarGrid';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed to 'md' for better tablet experience

    const [dueMap, reload, loading] = useDataHook(currentDate);

    const handlePrev = () => {
        setCurrentDate(d => subMonths(d, 1)); // Always navigate by months now
    };

    const handleNext = () => {
        setCurrentDate(d => addMonths(d, 1)); // Always navigate by months now
    };

    const handleDateChange = (newDate) => {
        setCurrentDate(newDate);
    };

    return (
        <Box
            ref={containerRef}
            id="main-box"
            sx={{
                display: "flex",
                flexDirection: "column",
                p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
                mt: { xs: 0.5, sm: 1, md: 2 },
                mx: { xs: 0.5, sm: 1, md: "auto" },
                height: { xs: "calc(100vh - 100px)", md: "85vh" }, // Fixed height instead of minHeight
                width: { xs: "calc(100vw - 8px)", sm: "calc(100vw - 16px)", md: "100%" },
                maxWidth: { xs: "100%", md: "calc(100vw - 240px)", xl: "1800px" },
                backdropFilter: "blur(18px)",
                background: (t) => t.palette.background.default,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: { xs: 1, md: 2 },
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                color: "#fff",
                overflow: 'hidden', // Prevent main container from scrolling
            }}
        >
            {loading ? (
                <Box sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 3
                }}>
                    <CircularProgress
                        sx={{
                            color: "#6C63FF",
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            }
                        }}
                        size={48}
                        thickness={3}
                    />
                    <Typography sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        Loading calendar...
                    </Typography>
                </Box>
            ) : (
                <>
                    <CalendarHeader
                        date={currentDate}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onDateChange={handleDateChange}
                        isMobile={isMobile}
                    />

                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        mt: 2,
                        minHeight: 0 // Important for flex child to shrink
                    }}>
                        <ResponsiveCalendarGrid
                            monthStart={currentDate}
                            dueMap={dueMap}
                            onSelect={(date, items) => setSelectedDay({ date, items })}
                            isMobile={isMobile}
                        />
                    </Box>

                    {/* Simplified Legend - Only show on desktop */}
                    {!isMobile && (
                        <Box sx={{
                            mt: 2,
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0 // Prevent legend from shrinking
                        }}>
                            {[
                                { label: 'Projects', color: '#ff007f' },
                                { label: 'Epics', color: '#f7b32b' },
                                { label: 'Tasks', color: '#1e90ff' },
                            ].map((item) => (
                                <Box key={item.label} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: item.color,
                                            boxShadow: `0 0 6px ${item.color}60`,
                                        }}
                                    />
                                    <Typography sx={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
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
