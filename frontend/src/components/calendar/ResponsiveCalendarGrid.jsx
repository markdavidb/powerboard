// src/components/calendar/ResponsiveCalendarGrid.jsx
import React from 'react';
import {Box, Typography, Chip} from '@mui/material';
import {
    format,
    isSameMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    startOfMonth,
    endOfMonth
} from 'date-fns';
import CalendarCell from './CalendarCell';
import {buildWeeks} from './calendarUtils';
import {Briefcase, Flag, ClipboardList} from 'lucide-react';

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLOR = {
    project: '#ff007f',
    epic: '#f7b32b',
    task: '#1e90ff',
};

const ICON = {
    project: <Briefcase size={14}/>,
    epic: <Flag size={14}/>,
    task: <ClipboardList size={14}/>,
};

// Mobile Agenda View - Full Month View
function MobileAgendaView({currentDate, dueMap, onSelect}) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({start: monthStart, end: monthEnd});

    return (
        <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflow: 'auto',
            px: 1
        }}>
            {monthDays.map((day) => {
                const iso = format(day, 'yyyy-MM-dd');
                const items = dueMap[iso] || [];
                const today = isSameDay(day, new Date());

                return (
                    <Box
                        key={iso}
                        onClick={() => onSelect(day, items)}
                        sx={{
                            background: today
                                ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(86,85,255,0.10))'
                                : 'rgba(255,255,255,0.05)',
                            borderRadius: 3,
                            border: today
                                ? '2px solid rgba(108,99,255,0.4)'
                                : '1px solid rgba(255,255,255,0.1)',
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                background: today
                                    ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(86,85,255,0.20))'
                                    : 'rgba(255,255,255,0.08)',
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        {/* Day Header */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: items.length > 0 ? 2 : 0
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Typography sx={{
                                    fontSize: '1.1rem',
                                    fontWeight: today ? 700 : 600,
                                    color: today ? '#6C63FF' : '#fff',
                                }}>
                                    {format(day, 'd')}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.9rem',
                                    color: today ? '#6C63FF' : 'rgba(255,255,255,0.7)',
                                    fontWeight: 500
                                }}>
                                    {format(day, 'EEE')}
                                </Typography>
                                {today && (
                                    <Chip
                                        label="Today"
                                        size="small"
                                        sx={{
                                            background: 'rgba(108,99,255,0.2)',
                                            color: '#6C63FF',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 20
                                        }}
                                    />
                                )}
                            </Box>

                            {items.length > 0 && (
                                <Chip
                                    label={`${items.length} item${items.length > 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: '0.7rem',
                                        height: 20
                                    }}
                                />
                            )}
                        </Box>

                        {/* Items List */}
                        {items.length > 0 && (
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                {items.slice(0, 4).map((item, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            outline: 'red solid 1px',

                                            gap: 1.5,
                                            p: 1.5,
                                            background: `${COLOR[item.type]}20`,
                                            border: `1px solid ${COLOR[item.type]}40`,
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: `${COLOR[item.type]}30`,
                                                transform: 'translateX(8px)',
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
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography sx={{
                                                color: '#fff',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.title}
                                            </Typography>
                                            {item.description && (
                                                <Typography sx={{
                                                    color: 'rgba(255,255,255,0.7)',
                                                    fontSize: '0.75rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {item.description}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Chip
                                            label={item.type.toUpperCase()}
                                            size="small"
                                            sx={{
                                                background: COLOR[item.type],
                                                color: '#fff',
                                                fontSize: '0.6rem',
                                                fontWeight: 600,
                                                height: 18,
                                                '& .MuiChip-label': {px: 1}
                                            }}
                                        />
                                    </Box>
                                ))}
                                {items.length > 4 && (
                                    <Typography sx={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.8rem',
                                        textAlign: 'center',
                                        fontStyle: 'italic'
                                    }}>
                                        +{items.length - 4} more items
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// Desktop Grid View - FIXED WITH TALLER CELLS!
function DesktopGridView({monthStart, dueMap, onSelect}) {
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
                gap: 1,
                mb: 1,
            }}>
                {dayHeaders.map((day) => (
                    <Box
                        key={day}
                        sx={{
                            textAlign: 'center',
                            py: 1.5,
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        <Typography sx={{
                            fontSize: '0.875rem',
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

            {/* Calendar Grid - MADE MUCH TALLER! */}
            <Box
                sx={{
                    p:2,
                    flex: 1,
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: `repeat(${weeks.length}, minmax(250px, 1fr))`, // INCREASED FROM 140px TO 350px!
                    gap: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                {weeks.flat().map((day) => {
                    const iso = format(day, 'yyyy-MM-dd');
                    const items = dueMap[iso] || [];
                    const inMonth = isSameMonth(day, monthStart);

                    if (!inMonth) {
                        return (
                            <Box
                                key={iso}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(255,255,255,0.02)',
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

                    return <CalendarCell key={iso} day={day} items={items} onSelect={onSelect}/>;
                })}
            </Box>
        </Box>
    );
}

export default function ResponsiveCalendarGrid({monthStart, dueMap, onSelect, isMobile}) {
    return isMobile ? (
        <MobileAgendaView
            currentDate={monthStart}
            dueMap={dueMap}
            onSelect={onSelect}
        />
    ) : (
        <DesktopGridView
            monthStart={monthStart}
            dueMap={dueMap}
            onSelect={onSelect}
        />
    );
}
