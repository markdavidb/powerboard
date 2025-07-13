// src/components/ModernFilterMenu.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Fade,
    Paper,
    Divider,
    IconButton,
    Popper,
    ClickAwayListener,
} from '@mui/material';
import {
    Check,
    X,
    Clock,
    AlertTriangle,
    Calendar,
    CalendarX,
} from 'lucide-react';

const ModernFilterMenu = ({
    open,
    anchorEl,
    onClose,
    value,
    onChange,
    monthYear,
    setMonthYear,
    onApplyMonthYear
}) => {
    const [hoveredOption, setHoveredOption] = useState(null);

    const quickOptions = [
        {
            id: '',
            label: 'All tasks',
            description: 'Show everything',
            icon: Calendar,
            color: '#6B7280',
            bgColor: 'rgba(107, 114, 128, 0.1)',
        },
        {
            id: 'overdue',
            label: 'Overdue',
            description: 'Past due date',
            icon: AlertTriangle,
            color: '#EF4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
        },
        {
            id: 'today',
            label: 'Due today',
            description: 'Due by end of day',
            icon: Clock,
            color: '#F59E0B',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        },
        {
            id: 'week',
            label: 'Next 7 days',
            description: 'Due within a week',
            icon: Calendar,
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
            id: 'none',
            label: 'No due date',
            description: 'Tasks without deadlines',
            icon: CalendarX,
            color: '#6B7280',
            bgColor: 'rgba(107, 114, 128, 0.1)',
        },
    ];

    const handleOptionClick = (optionId) => {
        onChange(optionId);
        onClose();
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-start"
            transition
            sx={{ zIndex: 1300 }}
            modifiers={[
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                        fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                        boundary: 'viewport',
                        padding: 8,
                    },
                },
                {
                    name: 'preventOverflow',
                    enabled: true,
                    options: {
                        boundary: 'viewport',
                        padding: 8,
                    },
                },
            ]}
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                    <Paper
                        sx={{
                            minWidth: 280,
                            maxWidth: { xs: 'calc(100vw - 32px)', sm: 320 },
                            maxHeight: { xs: '40vh', sm: '50vh' }, // Reduced heights
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08))',
                            backdropFilter: 'blur(24px)',
                            boxShadow: `
                                0 0 0 1px rgba(255, 255, 255, 0.05),
                                0 8px 32px rgba(0, 0, 0, 0.32),
                                0 24px 64px rgba(0, 0, 0, 0.24)
                            `,
                            overflow: 'auto', // Added this to enable scrolling
                            padding: 1,
                            mt: 1,
                            // Custom scrollbar styling for better UX
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '3px',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.5)',
                                },
                            },
                        }}
                    >
                        <ClickAwayListener onClickAway={onClose}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Header - Fixed */}
                                <Box sx={{
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexShrink: 0
                                }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            letterSpacing: '0.025em'
                                        }}
                                    >
                                        Filter by due date
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={onClose}
                                        sx={{
                                            color: '#9CA3AF',
                                            width: 24,
                                            height: 24,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }
                                        }}
                                    >
                                        <X size={14} />
                                    </IconButton>
                                </Box>

                                <Divider sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    mx: 1,
                                    flexShrink: 0
                                }} />

                                {/* Scrollable Options */}
                                <Box sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    // Fix mobile scrolling
                                    WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
                                    scrollBehavior: 'smooth',
                                    // Custom scrollbar styles
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '3px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '3px',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.3)',
                                        },
                                    },
                                    // Ensure minimum height for scrolling
                                    minHeight: 0,
                                }}>
                                    {/* Quick Options */}
                                    <Box sx={{ p: 1 }}>
                                        {quickOptions.map((option) => {
                                            const IconComponent = option.icon;
                                            const isSelected = value === option.id;
                                            const isHovered = hoveredOption === option.id;

                                            return (
                                                <Box
                                                    key={option.id}
                                                    onClick={() => handleOptionClick(option.id)}
                                                    onMouseEnter={() => setHoveredOption(option.id)}
                                                    onMouseLeave={() => setHoveredOption(null)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        backgroundColor: isSelected
                                                            ? 'rgba(108, 99, 255, 0.15)'
                                                            : isHovered
                                                                ? 'rgba(255, 255, 255, 0.08)'
                                                                : 'transparent',
                                                        border: isSelected
                                                            ? '1px solid rgba(108, 99, 255, 0.3)'
                                                            : '1px solid transparent',
                                                        transition: 'all 0.15s ease-out',
                                                        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                                                        '&:active': {
                                                            transform: 'translateY(0)',
                                                            transition: 'all 0.1s ease-out'
                                                        }
                                                    }}
                                                >
                                                    {/* Icon */}
                                                    <Box
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: 1.5,
                                                            backgroundColor: isSelected ? option.color : option.bgColor,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.15s ease-out',
                                                        }}
                                                    >
                                                        <IconComponent
                                                            size={14}
                                                            color={isSelected ? '#fff' : option.color}
                                                        />
                                                    </Box>

                                                    {/* Content */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: isSelected ? '#fff' : '#E5E7EB',
                                                                fontWeight: isSelected ? 600 : 500,
                                                                fontSize: '14px',
                                                                lineHeight: 1.2,
                                                                mb: 0.25
                                                            }}
                                                        >
                                                            {option.label}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#9CA3AF',
                                                                fontSize: '12px',
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            {option.description}
                                                        </Typography>
                                                    </Box>

                                                    {/* Check mark */}
                                                    {isSelected && (
                                                        <Box
                                                            sx={{
                                                                width: 18,
                                                                height: 18,
                                                                borderRadius: '50%',
                                                                backgroundColor: '#6C63FF',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                animation: 'fadeInScale 0.2s ease-out',
                                                                '@keyframes fadeInScale': {
                                                                    '0%': {
                                                                        opacity: 0,
                                                                        transform: 'scale(0.8)'
                                                                    },
                                                                    '100%': {
                                                                        opacity: 1,
                                                                        transform: 'scale(1)'
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Check size={10} color="#fff" />
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Divider sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                        mx: 1,
                                        my: 1
                                    }} />

                                    {/* Custom Date Range */}
                                    <Box sx={{ p: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#9CA3AF',
                                                fontWeight: 500,
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                mb: 1.5,
                                                display: 'block'
                                            }}
                                        >
                                            Custom range
                                        </Typography>

                                        <TextField
                                            type="month"
                                            value={monthYear}
                                            onChange={(e) => setMonthYear(e.target.value)}
                                            size="small"
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                        borderColor: '#6C63FF',
                                                        boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.1)',
                                                    },
                                                    '& fieldset': {
                                                        border: 'none',
                                                    },
                                                },
                                                '& input': {
                                                    color: '#fff',
                                                    '&::placeholder': {
                                                        color: '#9CA3AF',
                                                    },
                                                },
                                                mb: 1.5
                                            }}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={!monthYear}
                                            onClick={() => {
                                                onApplyMonthYear();
                                                onClose();
                                            }}
                                            sx={{
                                                background: monthYear
                                                    ? 'linear-gradient(135deg, #6C63FF, #9B78FF)'
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                color: monthYear ? '#fff' : '#9CA3AF',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                py: 1,
                                                fontSize: '14px',
                                                border: 'none',
                                                boxShadow: monthYear ? '0 4px 12px rgba(108, 99, 255, 0.3)' : 'none',
                                                '&:hover': {
                                                    background: monthYear
                                                        ? 'linear-gradient(135deg, #5A50E0, #8E6CF1)'
                                                        : 'rgba(255, 255, 255, 0.15)',
                                                    boxShadow: monthYear ? '0 6px 16px rgba(108, 99, 255, 0.4)' : 'none',
                                                    transform: monthYear ? 'translateY(-1px)' : 'none',
                                                },
                                                '&:disabled': {
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#6B7280',
                                                },
                                                transition: 'all 0.15s ease-out'
                                            }}
                                        >
                                            Apply custom range
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </ClickAwayListener>
                    </Paper>
                </Fade>
            )}
        </Popper>
    );
};

export default ModernFilterMenu;
