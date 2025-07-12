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
    Divider,
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

    // Auto-scroll to selected month when menu opens
    useEffect(() => {
        if (open && scrollRef.current) {
            const selectedElement = scrollRef.current.querySelector(`[data-month="${value || currentMonth}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [open, value, currentMonth]);

    const handleMonthClick = (monthValue) => {
        onChange(monthValue);
        onClose();
    };

    const handleCurrentMonth = () => {
        onChange(String(currentMonth));
        onClose();
    };

    const getCurrentMonthName = () => {
        return months.find(m => m.value === String(currentMonth))?.label || 'Current Month';
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement = "top-start"
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
                            maxHeight: { xs: '65vh', sm: '55vh' }, // Increased height to see all items
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
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}>
                                {/* Header - More compact on mobile */}
                                <Box sx={{
                                    px: 2,
                                    py: { xs: 1, sm: 1.5 }, // Smaller padding on mobile
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
                                            fontSize: { xs: '13px', sm: '14px' }, // Smaller font on mobile
                                            letterSpacing: '0.025em'
                                        }}
                                    >
                                        {title || 'Select Month'}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={onClose}
                                        sx={{
                                            color: '#9CA3AF',
                                            p: { xs: 0.5, sm: 1 }, // Smaller padding on mobile
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

                                {/* Action Buttons - More compact on mobile */}
                                <Box sx={{
                                    px: 2,
                                    py: { xs: 0.5, sm: 1 }, // Smaller padding on mobile
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 0.5, sm: 1 }, // Smaller gap on mobile
                                    flexShrink: 0
                                }}>
                                    <Button
                                        fullWidth
                                        size="small"
                                        onClick={handleCurrentMonth}
                                        sx={{
                                            background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            py: { xs: 0.5, sm: 0.75 }, // Smaller padding on mobile
                                            fontSize: { xs: '12px', sm: '13px' }, // Smaller font on mobile
                                            boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5A50E0, #8E6CF1)',
                                                boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)',
                                            },
                                        }}
                                    >
                                        Current Month ({getCurrentMonthName()})
                                    </Button>
                                    <Button
                                        fullWidth
                                        size="small"
                                        onClick={() => {
                                            onChange('');
                                            onClose();
                                        }}
                                        sx={{
                                            color: '#9CA3AF',
                                            textTransform: 'none',
                                            fontSize: { xs: '12px', sm: '13px' }, // Smaller font on mobile
                                            py: { xs: 0.25, sm: 0.5 }, // Smaller padding on mobile
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff'
                                            },
                                        }}
                                    >
                                        Clear Selection (All Months)
                                    </Button>
                                </Box>

                                <Divider sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    mx: 1,
                                    flexShrink: 0
                                }} />

                                {/* Scrollable Months Grid - Bigger items, shorter modal */}
                                <Box
                                    ref={scrollRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        // Critical mobile scroll fixes
                                        touchAction: 'pan-y',
                                        position: 'relative',
                                        transform: 'translateZ(0)',
                                        willChange: 'scroll-position',
                                        // Prevent momentum scrolling issues
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                            display: { xs: 'none', sm: 'block' },
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
                                        // Shorter modal with proper scrolling
                                        minHeight: { xs: '150px', sm: '200px' },
                                        maxHeight: { xs: '50vh', sm: '40vh' }, // Much shorter modal
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: { xs: 1, sm: 1.5 }, // Bigger gaps
                                            p: { xs: 1.5, sm: 2 },
                                            minHeight: 'fit-content',
                                            pb: { xs: 1, sm: 2 }, // Better bottom padding
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
                                                        minHeight: { xs: 50, sm: 55 }, // Much smaller items
                                                        borderRadius: 2, // Smaller border radius
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
                                                            ? '2px solid rgba(108, 99, 255, 0.5)'
                                                            : isCurrentMonth
                                                                ? '1px solid rgba(108, 99, 255, 0.3)'
                                                                : '1px solid transparent',
                                                        transition: 'all 0.15s ease-out',
                                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                        // Prevent touch delay on mobile
                                                        WebkitTapHighlightColor: 'transparent',
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2" // Smaller typography variant
                                                        sx={{
                                                            color: isSelected
                                                                ? '#fff'
                                                                : isCurrentMonth
                                                                    ? '#6C63FF'
                                                                    : '#E5E7EB',
                                                            fontWeight: isSelected || isCurrentMonth ? 600 : 500,
                                                            fontSize: { xs: '14px', sm: '15px' }, // Much smaller font
                                                            textAlign: 'center',
                                                            lineHeight: 1.2,
                                                            mb: 0.2, // Smaller margin
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
                                                            fontSize: { xs: '11px', sm: '12px' }, // Much smaller subtitle
                                                            fontWeight: 400, // Lighter weight
                                                        }}
                                                    >
                                                        {month.short}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                width: { xs: 18, sm: 20 }, // Bigger check icon
                                                                height: { xs: 18, sm: 20 },
                                                                borderRadius: '50%',
                                                                backgroundColor: '#6C63FF',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Check size={12} color="#fff" />
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
