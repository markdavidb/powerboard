// src/pages/MainCalendar/CalendarHeader.jsx
import React, { useState } from 'react';
import { Box, IconButton, Button } from '@mui/material';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { format, setYear, setMonth } from 'date-fns';
import ModernSelectMenu from '../ModernSelectMenu';

export default function CalendarHeader({ date, onPrev, onNext, onDateChange }) {
    const [yearMenuAnchor, setYearMenuAnchor] = useState(null);
    const [monthMenuAnchor, setMonthMenuAnchor] = useState(null);
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();

    // Generate year options (10 years back, 10 years forward)
    const yearOptions = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        yearOptions.push({ value: i, label: i.toString() });
    }

    // Month options
    const monthOptions = [
        { value: 0, label: 'January' },
        { value: 1, label: 'February' },
        { value: 2, label: 'March' },
        { value: 3, label: 'April' },
        { value: 4, label: 'May' },
        { value: 5, label: 'June' },
        { value: 6, label: 'July' },
        { value: 7, label: 'August' },
        { value: 8, label: 'September' },
        { value: 9, label: 'October' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' },
    ];

    const handleYearSelect = (selectedYear) => {
        const newDate = setYear(date, selectedYear);
        onDateChange(newDate);
    };

    const handleMonthSelect = (selectedMonth) => {
        const newDate = setMonth(date, selectedMonth);
        onDateChange(newDate);
    };

    // Modern button styles for consistency
    const modernButtonStyle = {
        color: 'rgba(255,255,255,0.95)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        minWidth: { xs: '90px', sm: '110px', md: '130px' },
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
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 1, sm: 1.5, md: 2 },
            px: { xs: 1, sm: 2, md: 0 },
            gap: { xs: 1, sm: 2 }
        }}>
            {/* Previous Button */}
            <IconButton
                onClick={onPrev}
                sx={{
                    color: 'rgba(255,255,255,0.9)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    width: { xs: 40, sm: 44, md: 48 },
                    height: { xs: 40, sm: 44, md: 48 },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                        borderColor: 'rgba(108,99,255,0.4)',
                        transform: 'translateX(-4px) scale(1.05)',
                        boxShadow: '0 8px 24px rgba(108,99,255,0.2)',
                    },
                    '&:active': {
                        transform: 'translateX(-2px) scale(1.02)',
                    }
                }}
            >
                <ArrowLeft size={18} />
            </IconButton>

            {/* Month and Year Selectors */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5, md: 2 },
                flexGrow: 1,
                justifyContent: 'center'
            }}>
                {/* Month Picker Button */}
                <Button
                    onClick={(e) => setMonthMenuAnchor(e.currentTarget)}
                    endIcon={<ChevronDown size={16} />}
                    sx={modernButtonStyle}
                >
                    {format(date, 'MMMM')}
                </Button>

                {/* Year Picker Button */}
                <Button
                    onClick={(e) => setYearMenuAnchor(e.currentTarget)}
                    endIcon={<ChevronDown size={16} />}
                    sx={modernButtonStyle}
                >
                    {currentYear}
                </Button>

                {/* Month Modern Select Menu */}
                <ModernSelectMenu
                    open={Boolean(monthMenuAnchor)}
                    anchorEl={monthMenuAnchor}
                    onClose={() => setMonthMenuAnchor(null)}
                    value={currentMonth}
                    onChange={handleMonthSelect}
                    options={monthOptions}
                    title="Select Month"
                />

                {/* Year Modern Select Menu */}
                <ModernSelectMenu
                    open={Boolean(yearMenuAnchor)}
                    anchorEl={yearMenuAnchor}
                    onClose={() => setYearMenuAnchor(null)}
                    value={currentYear}
                    onChange={handleYearSelect}
                    options={yearOptions}
                    title="Select Year"
                />
            </Box>

            {/* Next Button */}
            <IconButton
                onClick={onNext}
                sx={{
                    color: 'rgba(255,255,255,0.9)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    width: { xs: 40, sm: 44, md: 48 },
                    height: { xs: 40, sm: 44, md: 48 },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                        borderColor: 'rgba(108,99,255,0.4)',
                        transform: 'translateX(4px) scale(1.05)',
                        boxShadow: '0 8px 24px rgba(108,99,255,0.2)',
                    },
                    '&:active': {
                        transform: 'translateX(2px) scale(1.02)',
                    }
                }}
            >
                <ArrowRight size={18} />
            </IconButton>
        </Box>
    );
}
