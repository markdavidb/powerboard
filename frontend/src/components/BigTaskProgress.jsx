// src/components/BigTaskProgress.jsx
import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

export default function BigTaskProgress({ completed, total }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // Responsive sizing - bigger for PC
    const radius = isMobile ? 40 : 55; // increased PC size from 32 to 40
    const strokeWidth = isMobile ? 3 : 6; // slightly thicker stroke for PC
    const fontSize = isMobile ? '10px' : '14px'; // larger text for PC

    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Box sx={{
            position: 'relative',
            width: radius * 2,
            height: radius * 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Background circle */}
                <circle
                    stroke="rgba(255, 255, 255, 0.1)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress circle */}
                <circle
                    stroke="#00ff88"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{
                        transition: 'stroke-dashoffset 0.3s ease-in-out',
                        filter: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.3))'
                    }}
                />
            </svg>
            {/* Percentage text */}
            <Typography
                sx={{
                    position: 'absolute',
                    fontSize: fontSize,
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center'
                }}
            >
                {Math.round(percentage)}%
            </Typography>
        </Box>
    );
}
