// src/components/calendar/CalendarCell.jsx
import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Briefcase, Flag, ClipboardList } from 'lucide-react';

const MAX_ITEMS = 8; // Increased for bigger cells

const COLOR = {
    project: '#ff007f',
    epic: '#f7b32b',
    task: '#1e90ff',
};

const ICON = {
    project: <Briefcase size={14} />,
    epic: <Flag size={14} />,
    task: <ClipboardList size={14} />,
};

export default React.memo(function CalendarCell({ day, items = [], onSelect }) {
    const today = isSameDay(day, new Date());
    const inMonth = isSameMonth(day, new Date());

    return (
        <Box
            onClick={() => onSelect(day, items)}
            sx={{
                width: '100%',
                height: '100%', // Use 100% to fill grid space
                p: 1.5,
                position: 'relative',
                background: today
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(86,85,255,0.20))'
                    : 'rgba(70,70,110,0.4)',
                border: '1.5px solid',
                borderColor: today
                    ? 'rgba(108,99,255,0.6)'
                    : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                boxShadow: today
                    ? '0 0 15px rgba(108,99,255,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                opacity: inMonth ? 1 : 0.4,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                overflow: 'hidden',
                transform: 'scale(1)',
                '&:hover': {
                    transform: 'scale(1.02)',
                    background: today
                        ? 'linear-gradient(135deg, rgba(108,99,255,0.35), rgba(86,85,255,0.30))'
                        : 'rgba(80,80,120,0.6)',
                    boxShadow: today
                        ? '0 0 20px rgba(108,99,255,0.4)'
                        : '0 4px 12px rgba(108,99,255,0.15)',
                    borderColor: today
                        ? 'rgba(108,99,255,0.8)'
                        : 'rgba(108,99,255,0.3)',
                },
            }}
        >
            {/* Day Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: items.length > 0 ? 1.5 : 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        sx={{
                            fontWeight: today ? 700 : 600,
                            fontSize: '1.2rem',
                            color: today ? '#6C63FF' : '#fff',
                            textShadow: today ? '0 0 8px rgba(108,99,255,0.4)' : 'none',
                        }}
                    >
                        {format(day, 'd')}
                    </Typography>

                    {today && (
                        <Chip
                            label="Today"
                            size="small"
                            sx={{
                                background: 'rgba(108,99,255,0.2)',
                                color: '#6C63FF',
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 18
                            }}
                        />
                    )}
                </Box>

                {items.length > 0 && (
                    <Chip
                        label={`${items.length}`}
                        size="small"
                        sx={{
                            background: 'rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            height: 18,
                            minWidth: 18,
                            '& .MuiChip-label': { px: 0.5 }
                        }}
                    />
                )}
            </Box>

            {/* Items - Styled like mobile agenda view */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 0.5,
                // Custom scrollbar
                '&::-webkit-scrollbar': {
                    width: '3px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(108,99,255,0.4)',
                    borderRadius: '2px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(108,99,255,0.6)',
                },
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(108,99,255,0.4) transparent',
            }}>
                {items.slice(0, MAX_ITEMS).map((item, idx) => (
                    <Tooltip key={idx} title={`${item.title} (${item.type})`} arrow>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                background: `${COLOR[item.type]}20`,
                                border: `1px solid ${COLOR[item.type]}40`,
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: `${COLOR[item.type]}30`,
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 2px 8px ${COLOR[item.type]}30`,
                                }
                            }}
                        >
                            <Box sx={{
                                color: COLOR[item.type],
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {ICON[item.type]}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {item.title.length > 15 ? item.title.slice(0, 15) + '…' : item.title}
                                </Typography>
                                {item.description && (
                                    <Typography sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.65rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.description.length > 20 ? item.description.slice(0, 20) + '…' : item.description}
                                    </Typography>
                                )}
                            </Box>
                            <Chip
                                label={item.type.charAt(0).toUpperCase()}
                                size="small"
                                sx={{
                                    background: COLOR[item.type],
                                    color: '#fff',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    height: 16,
                                    minWidth: 16,
                                    '& .MuiChip-label': { px: 0.3 }
                                }}
                            />
                        </Box>
                    </Tooltip>
                ))}

                {items.length > MAX_ITEMS && (
                    <Box
                        sx={{
                            mt: 0.5,
                            p: 0.5,
                            background: 'rgba(156,163,175,0.2)',
                            border: '1px solid rgba(156,163,175,0.3)',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}
                    >
                        <Typography sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.65rem',
                            fontWeight: 600
                        }}>
                            +{items.length - MAX_ITEMS} more
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
});
