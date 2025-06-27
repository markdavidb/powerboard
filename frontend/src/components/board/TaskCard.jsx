// src/components/board/TaskCard.jsx
import React from 'react';
import { Paper, Typography, Chip, Box, useTheme } from '@mui/material';
import {
    ClipboardList,
    RefreshCcw,
    Search,
    CheckCircle,
    ChevronsUp,
    ChevronUp,
    Minus,
    ChevronDown,
    ChevronsDown,
    Ban
} from 'lucide-react';

const statusIcons = {
    'To Do':       { icon: <ClipboardList size={16} />, color: '#6c6c6c' },
    'In Progress': { icon: <RefreshCcw   size={16} />, color: '#2196f3' },
    'Review':      { icon: <Search       size={16} />, color: '#ff9800' },
    'Done':        { icon: <CheckCircle  size={16} />, color: '#4caf50' },
};

const priorityIcons = {
    Highest: { icon: <ChevronsUp   size={16} />, color: '#e53935' },
    High:    { icon: <ChevronUp    size={16} />, color: '#ffb300' },
    Medium:  { icon: <Minus        size={16} />, color: '#1e88e5' },
    Low:     { icon: <ChevronDown  size={16} />, color: '#43a047' },
    Lowest:  { icon: <ChevronsDown size={16} />, color: '#757575' },
    blocker: { icon: <Ban          size={16} />, color: '#b71c1c' },
};

export default function TaskCard({ task, onClick }) {
    const theme = useTheme();
    const statusData   = statusIcons[task.status]   || {};
    const priorityData = priorityIcons[task.priority] || {};

    return (
        <Paper
            elevation={0}
            onClick={() => onClick && onClick(task)}
            sx={{
                position: 'relative',
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(24,24,30,0.6)',
                color: theme.palette.common.white,
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1.5px 4px rgba(0,0,0,0.16)',
                maxWidth: 350,        // 👈 ADD THIS LINE!
                width: '100%',        // always fill available width up to maxWidth
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    background: statusData.color ?? priorityData.color ?? theme.palette.primary.main,
                },
            }}
        >

        {/* Title */}
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    mb: 1,
                    whiteSpace: 'normal',         // allow wrapping
                    overflowWrap: 'break-word',   // wrap mid-word if needed
                    wordBreak: 'break-word',      // break long words
                    lineHeight: 1.35,
                    minHeight: 0,                 // allow card to shrink
                    maxHeight: 52,                // (optional) limit to 2 lines
                    display: '-webkit-box',
                    WebkitLineClamp: 2,           // (optional) limit to 2 lines
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}
            >
                {task.title}
            </Typography>

            {/* Optional label chip */}
            {task.label && (
                <Chip
                    label={task.label}
                    size="small"
                    sx={{
                        mb: 1,
                        backgroundColor: 'rgba(108,99,255,0.25)',
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        borderRadius: 1,
                    }}
                />
            )}

            {/* Status & Priority */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {task.status && (
                    <Chip
                        icon={statusData.icon}
                        label={task.status}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            color: statusData.color,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                        }}
                    />
                )}
                {task.priority && (
                    <Chip
                        icon={priorityData.icon}
                        label={task.priority}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: priorityData.color,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                        }}
                    />
                )}
            </Box>

            {/* Assigned by */}
            {task.creator_name && (
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 1.5,
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                    }}
                >
                    Assigned by: {task.creator_name}
                </Typography>
            )}
        </Paper>
    );
}
