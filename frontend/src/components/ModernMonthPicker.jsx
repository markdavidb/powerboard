// src/components/ModernMonthPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Fade,
    Paper,
    IconButton,
    Popper,
    ClickAwayListener,
    Button,
} from '@mui/material';
import { Check, X } from 'lucide-react';

const ModernMonthPicker = ({
    open,
    anchorEl,
    onClose,
    value,
    onChange,
    title,
}) => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const scrollRef = useRef(null);

    const months = [
        { value: '1', label: 'January', short: 'Jan' },
        { value: '2', label: 'February', short: 'Feb' },
        { value: '3', label: 'March', short: 'Mar' },
        { value: '4', label: 'April', short: 'Apr' },
        { value: '5', label: 'May', short: 'May' },
        { value: '6', label: 'June', short: 'Jun' },
        { value: '7', label: 'July', short: 'Jul' },
        { value: '8', label: 'August', short: 'Aug' },
        { value: '9', label: 'September', short: 'Sep' },
        { value: '10', label: 'October', short: 'Oct' },
        { value: '11', label: 'November', short: 'Nov' },
        { value: '12', label: 'December', short: 'Dec' },
    ];

    const handleMonthClick = (monthValue) => {
        onChange(monthValue);
        onClose();
    };

    const handleCurrentMonth = () => {
        onChange(String(currentMonth));
        onClose();
    };

    const getCurrentMonthName = () => {
        return months.find(m => m.value === String(currentMonth))?.short || 'Current';
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="top-start"
            transition
            sx={{ zIndex: 1300 }}
            modifiers={[
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                        fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
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
                            height: { xs: '35vh', sm: '45vh' }, // Fixed height, smaller than year picker
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
                            overflow: 'hidden',
                            padding: 1,
                            mt: 1,
                        }}
                    >
                        <ClickAwayListener onClickAway={onClose}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Compact Header */}
                                <Box sx={{
                                    px: 2,
                                    py: 1,
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
                                            fontSize: '13px',
                                        }}
                                    >
                                        {title || 'Select Month'}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={onClose}
                                        sx={{
                                            color: '#9CA3AF',
                                            width: 20,
                                            height: 20,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }
                                        }}
                                    >
                                        <X size={12} />
                                    </IconButton>
                                </Box>

                                {/* Compact Action Buttons */}
                                <Box sx={{ px: 2, py: 0.5, display: 'flex', gap: 1, flexShrink: 0 }}>
                                    <Button
                                        size="small"
                                        onClick={handleCurrentMonth}
                                        sx={{
                                            background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 1.5,
                                            py: 0.5,
                                            px: 1.5,
                                            fontSize: '11px',
                                            minHeight: 28,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5A50E0, #8E6CF1)',
                                            },
                                        }}
                                    >
                                        Current ({getCurrentMonthName()})
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            onChange('');
                                            onClose();
                                        }}
                                        sx={{
                                            color: '#9CA3AF',
                                            textTransform: 'none',
                                            fontSize: '11px',
                                            py: 0.5,
                                            px: 1.5,
                                            minHeight: 28,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff'
                                            },
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </Box>

                                {/* Scrollable Months Grid - More space */}
                                <Box
                                    ref={scrollRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        WebkitOverflowScrolling: 'touch',
                                        touchAction: 'pan-y',
                                        transform: 'translateZ(0)',
                                        '&::-webkit-scrollbar': {
                                            width: '4px',
                                            display: { xs: 'none', sm: 'block' },
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '2px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '2px',
                                        },
                                        minHeight: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: 0.5,
                                            p: 1,
                                        }}
                                    >
                                        {months.map((month) => {
                                            const isSelected = value === month.value;
                                            const isCurrentMonth = parseInt(month.value) === currentMonth;
                                            const isHovered = hoveredMonth === month.value;

                                            return (
                                                <Box
                                                    key={month.value}
                                                    data-month={month.value}
                                                    onClick={() => handleMonthClick(month.value)}
                                                    onMouseEnter={() => setHoveredMonth(month.value)}
                                                    onMouseLeave={() => setHoveredMonth(null)}
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: 40,
                                                        borderRadius: 1.5,
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        backgroundColor: isSelected
                                                            ? 'rgba(108, 99, 255, 0.2)'
                                                            : isCurrentMonth
                                                                ? 'rgba(108, 99, 255, 0.1)'
                                                                : isHovered
                                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                                    : 'transparent',
                                                        border: isSelected
                                                            ? '1px solid rgba(108, 99, 255, 0.5)'
                                                            : isCurrentMonth
                                                                ? '1px solid rgba(108, 99, 255, 0.3)'
                                                                : '1px solid transparent',
                                                        transition: 'all 0.15s ease-out',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: isSelected
                                                                ? '#fff'
                                                                : isCurrentMonth
                                                                    ? '#6C63FF'
                                                                    : '#E5E7EB',
                                                            fontWeight: isSelected || isCurrentMonth ? 600 : 500,
                                                            fontSize: '12px',
                                                            textAlign: 'center',
                                                            lineHeight: 1.2,
                                                            mb: 0.25,
                                                        }}
                                                    >
                                                        {month.label}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isSelected
                                                                ? 'rgba(255, 255, 255, 0.8)'
                                                                : isCurrentMonth
                                                                    ? 'rgba(108, 99, 255, 0.8)'
                                                                    : '#9CA3AF',
                                                            fontSize: '10px',
                                                        }}
                                                    >
                                                        {month.short}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 2,
                                                                right: 2,
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                backgroundColor: '#6C63FF',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Check size={8} color="#fff" />
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
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

export default ModernMonthPicker;
