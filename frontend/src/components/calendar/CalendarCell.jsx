// src/pages/MainCalendar/CalendarCell.jsx
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Briefcase, Flag, ClipboardList } from 'lucide-react';


const MAX_ITEMS = 4; // 👈 adjust for your taste and size

const COLOR = {
    project: '#ff007f',
    epic: '#f7b32b',
    task: '#1e90ff',
};
const ICON = {
    project: <Briefcase size={14} style={{ marginRight: 4 }} />,
    epic:    <Flag      size={14} style={{ marginRight: 4 }} />,
    task:    <ClipboardList size={14} style={{ marginRight: 4 }} />,
};

export default React.memo(function CalendarCell({ day, items = [], onSelect }) {
    const today = isSameDay(day, new Date());
    const inMonth = isSameMonth(day, new Date());

    return (
        <Box
            onClick={() => onSelect(day, items)}
            sx={{
                width: '100%',
                aspectRatio: '1 / 1', // Responsive height, e.g. 140px width → 112px height
                minWidth: 80,
                minHeight: 64,
                maxWidth: 210,
                maxHeight: 170,
                p: { xs: 0, md: 1 },
                position: 'relative',
                background: today
                    ? 'linear-gradient(135deg, rgba(0,255,170,0.18), rgba(0,180,255,0.15))'
                    : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(5px)',
                borderRadius: 3,
                boxShadow: today
                    ? '0 0 1px rgba(0, 200, 255, 0.4)'
                    : 'inset 0 0 0 rgba(255,255,255,0)',
                transition: 'all 0.25s ease',
                opacity: inMonth ? 1 : 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                '&:hover': {
                    transform: 'scale(1.045)',
                    background: today
                        ? 'linear-gradient(135deg, rgba(0,255,170,0.25), rgba(0,180,255,0.2))'
                        : 'rgba(255,255,255,0.06)',
                    boxShadow: '0 1px 10px rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                },
                // 🔥 Custom scrollbar theme:
                overflowY: 'auto',
                overflowX: 'hidden',
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
            <Typography
                sx={{
                    width: '100%',
                    textAlign: 'center', // ✅ Center horizontally
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: '#fff',
                }}
            >
                {format(day, 'd')}
            </Typography>


            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                {items.slice(0, MAX_ITEMS).map((it, idx) => (
                    <Tooltip key={idx} title={`${it.title} (${it.type})`} arrow>
                        <Box
                            sx={{
                                width: '100%',
                                backgroundColor: COLOR[it.type],
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#fff',
                                px: 0.5,
                                height: 18,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {ICON[it.type]} {it.title.length > 10 ? it.title.slice(0, 10) + '…' : it.title}
                        </Box>
                    </Tooltip>
                ))}
                {items.length > MAX_ITEMS && (
                    <Box
                        sx={{
                            mt: 0.5,
                            width: '100%',
                            backgroundColor: '#555',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#fff',
                            textAlign: 'center',
                            px: 0.5,
                            height: 18,
                            lineHeight: '18px',
                        }}
                    >
                        +{items.length - MAX_ITEMS} more
                    </Box>
                )}
            </Box>

            {today && (
                <Box
                    sx={{
                        mt: 1,
                        alignSelf: 'center',
                        width: 8,
                        height: 8,
                        ml: 1,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00c896, #0096ff)',
                        animation: 'pulse 1.5s infinite',
                    }}
                />
            )}

            <style>{`
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.3); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
        </Box>
    );
});
