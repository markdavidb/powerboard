// src/components/ModernYearPicker.jsx
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
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ModernYearPicker = ({
    open,
    anchorEl,
    onClose,
    value,
    onChange,
    title,
}) => {
    const currentYear = new Date().getFullYear();
    const [displayYear, setDisplayYear] = useState(value ? parseInt(value) : currentYear);
    const [hoveredYear, setHoveredYear] = useState(null);
    const scrollRef = useRef(null);

    // Generate years around the display year
    const generateYears = (centerYear) => {
        const years = [];
        const startYear = centerYear - 10;
        const endYear = centerYear + 10;

        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
    };

    const years = generateYears(displayYear);

    // Auto-scroll to selected year when menu opens
    useEffect(() => {
        if (open && scrollRef.current) {
            const selectedElement = scrollRef.current.querySelector(`[data-year="${value || currentYear}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [open, value, currentYear]);

    const handleYearClick = (year) => {
        onChange(String(year));
        onClose();
    };

    const handlePrevDecade = () => {
        setDisplayYear(prev => prev - 10);
    };

    const handleNextDecade = () => {
        setDisplayYear(prev => prev + 10);
    };

    const handleCurrentYear = () => {
        setDisplayYear(currentYear);
        onChange(String(currentYear));
        onClose();
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="top-start" // Changed from bottom-start to top-start for mobile
            transition
            sx={{ zIndex: 1300 }}
            modifiers={[
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                        fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'], // Prefer top, fallback to bottom
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
                            maxHeight: { xs: '50vh', sm: '60vh' }, // Reduced height
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
                                        {title || 'Select Year'}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={onClose}
                                        sx={{
                                            color: '#9CA3AF',
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

                                {/* Navigation Controls */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 1,
                                    flexShrink: 0
                                }}>
                                    <IconButton
                                        size="small"
                                        onClick={handlePrevDecade}
                                        sx={{
                                            color: '#9CA3AF',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }
                                        }}
                                    >
                                        <ChevronLeft size={16} />
                                    </IconButton>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '14px'
                                        }}
                                    >
                                        {years[0]} - {years[years.length - 1]}
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        onClick={handleNextDecade}
                                        sx={{
                                            color: '#9CA3AF',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                color: '#fff'
                                            }
                                        }}
                                    >
                                        <ChevronRight size={16} />
                                    </IconButton>
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                                    <Button
                                        fullWidth
                                        size="small"
                                        onClick={handleCurrentYear}
                                        sx={{
                                            background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            py: 0.75,
                                            fontSize: '13px',
                                            boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5A50E0, #8E6CF1)',
                                                boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)',
                                            },
                                        }}
                                    >
                                        Current Year ({currentYear})
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
                                            fontSize: { xs: '14px', sm: '13px' },
                                            py: { xs: 1, sm: 0.5 },
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff'
                                            },
                                        }}
                                    >
                                        Clear Selection (All Years)
                                    </Button>
                                </Box>

                                <Divider sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    mx: 1,
                                    flexShrink: 0
                                }} />

                                {/* Scrollable Years Grid */}
                                <Box
                                    ref={scrollRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        // Enhanced mobile scrolling
                                        touchAction: 'pan-y',
                                        // Additional mobile scroll fixes
                                        transform: 'translateZ(0)', // Hardware acceleration
                                        willChange: 'scroll-position',
                                        // Ensure proper touch events
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                            display: { xs: 'none', sm: 'block' }, // Hide scrollbar on mobile
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
                                        minHeight: 0,
                                        // Add proper height calculation for mobile
                                        maxHeight: { xs: '35vh', sm: 'none' },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 1,
                                            p: 2,
                                        }}
                                    >
                                        {years.map((year) => {
                                            const isSelected = value === String(year);
                                            const isCurrentYear = year === currentYear;
                                            const isHovered = hoveredYear === year;

                                            return (
                                                <Box
                                                    key={year}
                                                    data-year={year}
                                                    onClick={() => handleYearClick(year)}
                                                    onMouseEnter={() => setHoveredYear(year)}
                                                    onMouseLeave={() => setHoveredYear(null)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: 40,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        backgroundColor: isSelected
                                                            ? 'rgba(108, 99, 255, 0.2)'
                                                            : isCurrentYear
                                                                ? 'rgba(108, 99, 255, 0.1)'
                                                                : isHovered
                                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                                    : 'transparent',
                                                        border: isSelected
                                                            ? '2px solid rgba(108, 99, 255, 0.5)'
                                                            : isCurrentYear
                                                                ? '1px solid rgba(108, 99, 255, 0.3)'
                                                                : '1px solid transparent',
                                                        transition: 'all 0.15s ease-out',
                                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: isSelected
                                                                ? '#fff'
                                                                : isCurrentYear
                                                                    ? '#6C63FF'
                                                                    : '#E5E7EB',
                                                            fontWeight: isSelected || isCurrentYear ? 600 : 500,
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {year}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 4,
                                                                right: 4,
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: '50%',
                                                                backgroundColor: '#6C63FF',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Check size={10} color="#fff" />
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

export default ModernYearPicker;
