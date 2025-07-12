// src/components/ModernSelectMenu.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Fade,
    Paper,
    IconButton,
    Popper,
    ClickAwayListener,
    Divider,
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
}) => {
    const [hoveredOption, setHoveredOption] = useState(null);

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
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
                            minWidth: 220,
                            maxWidth: { xs: 'calc(100vw - 32px)', sm: 280 },
                            maxHeight: { xs: '50vh', sm: '70vh' }, // Increased heights
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
                                {/* Optional Header - Fixed */}
                                {title && (
                                    <>
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
                                                {title}
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
                                    </>
                                )}

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
                                    {/* Options */}
                                    <Box sx={{ p: 1 }}>
                                        {options.map((option) => {
                                            const IconComponent = option.icon;
                                            const isSelected = value === option.value;
                                            const isHovered = hoveredOption === option.value;

                                            return (
                                                <Box
                                                    key={option.value}
                                                    onClick={() => handleOptionClick(option.value)}
                                                    onMouseEnter={() => setHoveredOption(option.value)}
                                                    onMouseLeave={() => setHoveredOption(null)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        backgroundColor: isSelected
                                                            ? 'rgba(108, 99, 255, 0.15)'
                                                            : isHovered
                                                                ? 'rgba(255, 255, 255, 0.08)'
                                                                : 'transparent',
                                                        border: isSelected
                                                            ? '1px solid rgba(108, 99, 255, 0.3)'
                                                            : '1px solid transparent',
                                                        transition: 'all 0.15s ease-out',
                                                    }}
                                                >
                                                    {IconComponent && (
                                                        <IconComponent
                                                            size={16}
                                                            color={isSelected ? '#fff' : '#9CA3AF'}
                                                        />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            flex: 1,
                                                            color: isSelected ? '#fff' : '#E5E7EB',
                                                            fontWeight: isSelected ? 600 : 500,
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {option.label}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Check size={16} color="#6C63FF" />
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
