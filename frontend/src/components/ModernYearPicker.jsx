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
                            height: { xs: '40vh', sm: '50vh' }, // Fixed height instead of maxHeight
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
                                        {title || 'Select Year'}
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

                                {/* Compact Navigation */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 0.5,
                                    flexShrink: 0
                                }}>
                                    <IconButton
                                        size="small"
                                        onClick={handlePrevDecade}
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
                                        <ChevronLeft size={14} />
                                    </IconButton>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '12px'
                                        }}
                                    >
                                        {years[0]} - {years[years.length - 1]}
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        onClick={handleNextDecade}
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
                                        <ChevronRight size={14} />
                                    </IconButton>
                                </Box>

                                {/* Compact Action Buttons */}
                                <Box sx={{ px: 2, py: 0.5, display: 'flex', gap: 1, flexShrink: 0 }}>
                                    <Button
                                        size="small"
                                        onClick={handleCurrentYear}
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
                                        Current ({currentYear})
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

                                {/* Scrollable Years Grid - More space */}
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
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 0.5,
                                            p: 1,
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
                                                        minHeight: 32,
                                                        borderRadius: 1.5,
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
                                                            ? '1px solid rgba(108, 99, 255, 0.5)'
                                                            : isCurrentYear
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
                                                                : isCurrentYear
                                                                    ? '#6C63FF'
                                                                    : '#E5E7EB',
                                                            fontWeight: isSelected || isCurrentYear ? 600 : 500,
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {year}
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

export default ModernYearPicker;
