// src/components/ModernSelectMenu.jsx
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
    Menu,
    MenuItem,
} from '@mui/material';
import { Check, X, ChevronDown } from 'lucide-react';

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
            // Use a timeout to allow the popper to render and position itself correctly.
            const timer = setTimeout(() => {
                const selectedItem = scrollContainerRef.current.querySelector(`[data-value="${value}"]`);
                if (selectedItem) {
                    selectedItem.scrollIntoView({
                        block: 'center',
                        behavior: 'auto', // Use 'auto' for an instant scroll on open.
                    });
                }
            }, 50); // A small delay is sometimes necessary.
            return () => clearTimeout(timer);
        }
    }, [open, value]);

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    // Modern Select Menu Styles
    const modernSelectStyles = {
        button: {
            color: 'rgba(255,255,255,0.95)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            minWidth: minWidth,
            height: { xs: '40px', sm: '44px', md: '48px' },
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            fontWeight: 500,
            textTransform: 'none',
            padding: { xs: '8px 12px', sm: '10px 16px', md: '12px 20px' },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                borderColor: 'rgba(108,99,255,0.4)',
                color: '#fff',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(108,99,255,0.2)',
            },
            '&:active': {
                transform: 'translateY(0px)',
            }
        },
        menu: {
            '& .MuiPaper-root': {
                background: 'linear-gradient(135deg, rgba(30,30,46,0.98), rgba(40,40,60,0.95))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                maxHeight: { xs: '250px', sm: '300px', md: '350px' },
                minWidth: { xs: '140px', sm: '160px', md: '180px' },
                overflow: 'hidden',
                marginTop: '8px',
            },
            '& .MuiList-root': {
                padding: '8px',
                maxHeight: { xs: '230px', sm: '280px', md: '330px' },
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.6), rgba(108,99,255,0.4))',
                    borderRadius: '8px',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.8), rgba(108,99,255,0.6))',
                    }
                }
            }
        },
        menuItem: {
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
            fontWeight: 400,
            padding: { xs: '8px 12px', sm: '10px 16px', md: '12px 20px' },
            minHeight: { xs: '36px', sm: '40px', md: '44px' },
            borderRadius: '8px',
            margin: '2px 0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(108,99,255,0.05))',
                opacity: 0,
                transition: 'opacity 0.2s ease',
            },
            '&:hover': {
                backgroundColor: 'transparent',
                color: '#fff',
                transform: 'translateX(4px)',
                '&::before': {
                    opacity: 1,
                }
            },
            '&.Mui-selected': {
                backgroundColor: 'rgba(108,99,255,0.2)',
                color: '#fff',
                fontWeight: 600,
                '&::before': {
                    opacity: 1,
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(108,99,255,0.2))',
                },
                '&:hover': {
                    backgroundColor: 'rgba(108,99,255,0.25)',
                    transform: 'translateX(4px)',
                }
            }
        }
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
                            maxHeight: { xs: '40vh', sm: '50vh' }, // MADE SHORTER!
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
                                minHeight: 0 // Critical fix for proper flex shrinking
                            }}>
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

                                {/* Fixed Scrollable Options */}
                                <Box
                                    ref={scrollContainerRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        minHeight: 0, // CRITICAL FIX - allows flex container to shrink
                                        maxHeight: '100%',
                                        // Enhanced mobile scrolling
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        // Enhanced scrollbar styles
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
                                    {/* Options */}
                                    <Box sx={{ p: 1 }}>
                                        {options.map((option) => {
                                            const IconComponent = option.icon;
                                            const isSelected = value === option.value;
                                            const isHovered = hoveredOption === option.value;

                                            return (
                                                <Box
                                                    key={option.value}
                                                    data-value={option.value} // Add data-value for the scroll effect to find the element
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
