// src/components/ModernSelectMenuFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Fade,
    Paper,
    IconButton,
    Popper,
    ClickAwayListener,
} from '@mui/material';
import { Check, X } from 'lucide-react';

const ModernSelectMenu = ({
    open,
    anchorEl,
    onClose,
    value,
    onChange,
    options,
    title,
    placeholder = "Select...",
    minWidth = { xs: '90px', sm: '110px', md: '130px' },
    ...props
}) => {
    const [hoveredOption, setHoveredOption] = useState(null);
    const scrollContainerRef = useRef(null);

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        onClose();
    };

    // This effect scrolls the selected item into view when the menu opens.
    useEffect(() => {
        if (open && scrollContainerRef.current) {
            const timer = setTimeout(() => {
                const selectedItem = scrollContainerRef.current.querySelector(`[data-value="${value}"]`);
                if (selectedItem) {
                    selectedItem.scrollIntoView({
                        block: 'center',
                        behavior: 'auto',
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open, value]);

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
                            minWidth: { xs: 200, sm: 220, md: 240 },
                            maxWidth: { xs: 'calc(100vw - 32px)', sm: 300, md: 320 },
                            maxHeight: { xs: '60vh', sm: '70vh', md: '80vh' },
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'linear-gradient(135deg, rgba(30,30,46,0.98), rgba(40,40,60,0.95))',
                            backdropFilter: 'blur(24px)',
                            boxShadow: `
                                0 0 0 1px rgba(255, 255, 255, 0.05),
                                0 8px 32px rgba(0, 0, 0, 0.32),
                                0 24px 64px rgba(0, 0, 0, 0.24)
                            `,
                            overflow: 'hidden',
                            mt: 1,
                        }}
                    >
                        <ClickAwayListener onClickAway={onClose}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                minHeight: 0 // Critical for proper flex shrinking
                            }}>
                                {/* Optional Header - Fixed */}
                                {title && (
                                    <Box sx={{
                                        px: 2,
                                        py: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexShrink: 0,
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
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
                                            {title}
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
                                )}

                                {/* Scrollable Options Container - THIS IS THE KEY FIX */}
                                <Box
                                    ref={scrollContainerRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        minHeight: 0, // Essential for flex containers with scroll
                                        maxHeight: '100%',
                                        // Enhanced mobile scrolling
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        // Improved scrollbar styles
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '4px',
                                            margin: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'linear-gradient(135deg, rgba(108,99,255,0.6), rgba(108,99,255,0.4))',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, rgba(108,99,255,0.8), rgba(108,99,255,0.6))',
                                            },
                                            '&:active': {
                                                background: 'linear-gradient(135deg, rgba(108,99,255,1), rgba(108,99,255,0.8))',
                                            }
                                        },
                                        // Firefox scrollbar support
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgba(108,99,255,0.6) rgba(255,255,255,0.05)',
                                    }}
                                >
                                    {/* Options List */}
                                    <Box sx={{ p: 1 }}>
                                        {options.map((option, index) => {
                                            const IconComponent = option.icon;
                                            const isSelected = value === option.value;
                                            const isHovered = hoveredOption === option.value;

                                            return (
                                                <Box
                                                    key={option.value}
                                                    data-value={option.value}
                                                    onClick={() => handleOptionClick(option.value)}
                                                    onMouseEnter={() => setHoveredOption(option.value)}
                                                    onMouseLeave={() => setHoveredOption(null)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        p: { xs: 1.25, sm: 1.5 },
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        mb: index === options.length - 1 ? 0 : 0.5,
                                                        backgroundColor: isSelected
                                                            ? 'rgba(108, 99, 255, 0.2)'
                                                            : isHovered
                                                                ? 'rgba(255, 255, 255, 0.08)'
                                                                : 'transparent',
                                                        border: isSelected
                                                            ? '1px solid rgba(108, 99, 255, 0.4)'
                                                            : '1px solid transparent',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        transform: isHovered || isSelected ? 'translateX(4px)' : 'translateX(0)',
                                                        minHeight: { xs: 40, sm: 44 }, // Touch-friendly height
                                                        boxShadow: isSelected
                                                            ? '0 2px 8px rgba(108, 99, 255, 0.15)'
                                                            : 'none',
                                                    }}
                                                >
                                                    {IconComponent && (
                                                        <IconComponent
                                                            size={16}
                                                            color={isSelected ? '#fff' : isHovered ? '#E5E7EB' : '#9CA3AF'}
                                                            style={{ flexShrink: 0, transition: 'color 0.2s ease' }}
                                                        />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            flex: 1,
                                                            color: isSelected ? '#fff' : isHovered ? '#fff' : '#E5E7EB',
                                                            fontWeight: isSelected ? 600 : 500,
                                                            fontSize: { xs: '13px', sm: '14px' },
                                                            transition: 'color 0.2s ease',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {option.label}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Check
                                                            size={16}
                                                            color="#6C63FF"
                                                            style={{ flexShrink: 0 }}
                                                        />
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

export default ModernSelectMenu;
