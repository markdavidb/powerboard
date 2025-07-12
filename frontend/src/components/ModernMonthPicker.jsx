// src/components/ModernMonthPicker.jsx
import React, {useState, useEffect, useRef} from 'react';
import {useTheme, useMediaQuery} from '@mui/material';
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
import {Check, X} from 'lucide-react';

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
        {value: '1', label: 'January', short: 'Jan'},
        {value: '2', label: 'February', short: 'Feb'},
        {value: '3', label: 'March', short: 'Mar'},
        {value: '4', label: 'April', short: 'Apr'},
        {value: '5', label: 'May', short: 'May'},
        {value: '6', label: 'June', short: 'Jun'},
        {value: '7', label: 'July', short: 'Jul'},
        {value: '8', label: 'August', short: 'Aug'},
        {value: '9', label: 'September', short: 'Sep'},
        {value: '10', label: 'October', short: 'Oct'},
        {value: '11', label: 'November', short: 'Nov'},
        {value: '12', label: 'December', short: 'Dec'},
    ];

    // Auto-scroll to selected month when menu opens
    useEffect(() => {
        if (open && scrollRef.current) {
            const selectedElement = scrollRef.current.querySelector(
                `[data-month="${value || currentMonth}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({behavior: 'smooth', block: 'center'});
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
        return (
            months.find((m) => m.value === String(currentMonth))?.label ||
            'Current Month'
        );
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            disablePortal={false}                      // portal into <body>
            placement={isMobile ? 'auto-start' : 'bottom-start'}
            transition
            sx={{zIndex: theme.zIndex.modal}}       // above drawers/backdrops
            modifiers={[
                {
                    name: 'offset',
                    options: {offset: [0, 8]},      // small gap from the button
                },
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                        fallbackPlacements: [
                            'bottom-start',
                            'top-end',
                            'bottom-end',
                        ],
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
            {({TransitionProps}) => (
                <Fade {...TransitionProps} timeout={200}>
                    <Paper
                        sx={{
                            minWidth: 280,
                            maxWidth: {xs: 'calc(100vw - 32px)', sm: 320},
                            maxHeight: {xs: '50vh', sm: '40vh'},
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background:
                                'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08))',
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    minHeight: 0,
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        px: 2,
                                        py: {xs: 1, sm: 1.5},
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: {xs: '13px', sm: '14px'},
                                            letterSpacing: '0.025em',
                                        }}
                                    >
                                        {title || 'Select Month'}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={onClose}
                                        sx={{
                                            color: '#9CA3AF',
                                            p: {xs: 0.5, sm: 1},
                                            '&:hover': {
                                                backgroundColor:
                                                    'rgba(255, 255, 255, 0.1)',
                                                color: '#fff',
                                            },
                                        }}
                                    >
                                        <X size={14}/>
                                    </IconButton>
                                </Box>

                                <Divider
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                        mx: 1,
                                        flexShrink: 0,
                                    }}
                                />

                                {/* Action Buttons */}
                                <Box
                                    sx={{
                                        px: 2,
                                        py: {xs: 0.5, sm: 1},
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: {xs: 0.5, sm: 1},
                                        flexShrink: 0,
                                    }}
                                >
                                    <Button
                                        fullWidth
                                        size="small"
                                        onClick={handleCurrentMonth}
                                        sx={{
                                            background:
                                                'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            py: {xs: 0.5, sm: 0.75},
                                            fontSize: {xs: '12px', sm: '13px'},
                                            boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)',
                                            '&:hover': {
                                                background:
                                                    'linear-gradient(135deg, #5A50E0, #8E6CF1)',
                                                boxShadow:
                                                    '0 4px 12px rgba(108, 99, 255, 0.4)',
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
                                            fontSize: {xs: '12px', sm: '13px'},
                                            py: {xs: 0.25, sm: 0.5},
                                            '&:hover': {
                                                backgroundColor:
                                                    'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                            },
                                        }}
                                    >
                                        Clear Selection (All Months)
                                    </Button>
                                </Box>

                                <Divider
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                        mx: 1,
                                        flexShrink: 0,
                                    }}
                                />

                                {/* Scrollable Months Grid */}
                                <Box
                                    ref={scrollRef}
                                    sx={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        touchAction: 'pan-y',
                                        position: 'relative',
                                        transform: 'translateZ(0)',
                                        willChange: 'scroll-position',
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                            display: {xs: 'none', sm: 'block'},
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
                                        maxHeight: {xs: '50vh', sm: '40vh'},
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: {xs: 1, sm: 1.5},
                                            p: {xs: 1.5, sm: 2},
                                            minHeight: 'fit-content',
                                            pb: {xs: 1, sm: 2},
                                        }}
                                    >
                                        {months.map((month) => {
                                            const isSelected =
                                                value === month.value;
                                            const isCurrentMonth =
                                                parseInt(month.value, 10) ===
                                                currentMonth;
                                            const isHovered =
                                                hoveredMonth === month.value;

                                            return (
                                                <Box
                                                    key={month.value}
                                                    data-month={month.value}
                                                    onClick={() =>
                                                        handleMonthClick(
                                                            month.value
                                                        )
                                                    }
                                                    onMouseEnter={() =>
                                                        setHoveredMonth(
                                                            month.value
                                                        )
                                                    }
                                                    onMouseLeave={() =>
                                                        setHoveredMonth(null)
                                                    }
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: {
                                                            xs: 50,
                                                            sm: 55,
                                                        },
                                                        borderRadius: 2,
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
                                                        transition:
                                                            'all 0.15s ease-out',
                                                        transform: isHovered
                                                            ? 'scale(1.05)'
                                                            : 'scale(1)',
                                                        WebkitTapHighlightColor:
                                                            'transparent',
                                                        userSelect: 'none',
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
                                                            fontWeight:
                                                                isSelected ||
                                                                isCurrentMonth
                                                                    ? 600
                                                                    : 500,
                                                            fontSize: {
                                                                xs: '14px',
                                                                sm: '15px',
                                                            },
                                                            textAlign:
                                                                'center',
                                                            lineHeight: 1.2,
                                                            mb: 0.2,
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
                                                            fontSize: {
                                                                xs: '11px',
                                                                sm: '12px',
                                                            },
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        {month.short}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Box
                                                            sx={{
                                                                position:
                                                                    'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                width: {
                                                                    xs: 18,
                                                                    sm: 20,
                                                                },
                                                                height: {
                                                                    xs: 18,
                                                                    sm: 20,
                                                                },
                                                                borderRadius:
                                                                    '50%',
                                                                backgroundColor:
                                                                    '#6C63FF',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <Check
                                                                size={12}
                                                                color="#fff"
                                                            />
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
