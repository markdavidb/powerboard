import React from 'react';
import {
    Box,
    IconButton,
    Button,
    Select,
    MenuItem,
    Typography,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    Calendar as TodayIcon,
    Search,
    Bell,
} from 'lucide-react';

export default function CalendarCommandPanel({
                                                 view,
                                                 onViewChange,
                                                 currentDate,
                                                 onPrev,
                                                 onNext,
                                                 onToday,
                                                 onNewEvent,
                                                 onToggleSidebar,
                                                 onOpenSettings,
                                             }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 3,
                borderRadius: 5,
                background: 'rgba(30,30,47,0.65)',
                backdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Left Controls */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                <IconButton onClick={onToggleSidebar} size="large" sx={{color: '#fff'}}>
                    <MenuIcon/>
                </IconButton>

                <Select
                    value={
                        view === 'timeGridWeek'
                            ? 'week'
                            : view === 'dayGridMonth'
                                ? 'month'
                                : 'day'
                    }
                    onChange={e => onViewChange(e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{
                        minWidth: 120,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.15)',
                        },
                        '& .MuiSelect-icon': {color: '#aaa'},
                    }}
                >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                </Select>

                <IconButton onClick={onOpenSettings} size="large" sx={{color: '#fff'}}>
                    <SettingsIcon/>
                </IconButton>
            </Box>

            {/* Center Date Controls */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <IconButton onClick={onPrev} size="large" sx={{color: '#fff'}}>
                    <ChevronLeft/>
                </IconButton>
                <IconButton onClick={onToday} size="large" sx={{color: '#fff'}}>
                    <TodayIcon/>
                </IconButton>
                <IconButton onClick={onNext} size="large" sx={{color: '#fff'}}>
                    <ChevronRight/>
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#fff',
                        fontWeight: 500,
                        ml: 1,
                        letterSpacing: '0.5px',
                        textShadow: '0 1px 1px rgba(0,0,0,0.25)',
                    }}
                >
                    {currentDate.toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </Typography>
            </Box>

            {/* Right Action Buttons */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                <IconButton size="large" sx={{color: '#fff'}}>
                    <Search/>
                </IconButton>
                <IconButton size="large" sx={{color: '#fff'}}>
                    <Bell/>
                </IconButton>
                <Button
                    onClick={onNewEvent}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #ff4081, #ffc107)',
                        color: '#1e1e2f',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #ff4081, #ffb300)',
                        },
                    }}
                >
                    + New Event
                </Button>
            </Box>
        </Box>
    );
}
