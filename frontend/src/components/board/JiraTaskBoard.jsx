// src/components/board/JiraTaskBoard.jsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import TaskCard from './TaskCard';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

export default function JiraTaskBoard({ tasks = [], onTaskClick }) {
    const theme = useTheme();

    // group tasks by status
    const buckets = STATUSES.map(status => ({
        status,
        items: tasks.filter(t => t.status === status),
    }));

    return (
        <Box
            sx={{
                ml: 2,
                display: 'flex',
                gap: 2,
                p: 2,
                overflowX: 'auto',
                height: '60vh', // Make the board tall enough for vertical scrollbars
                alignItems: 'flex-start',
                '&::-webkit-scrollbar': { height: 3 },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(108,99,255,0.4)',
                    borderRadius: 3,
                },
            }}
        >
            {buckets.map(({ status, items }) => (
                <Box
                    key={status}
                    sx={{
                        minWidth: 360,
                        maxWidth: 320,
                        width: 300,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'none',
                        boxShadow: 'none',
                        height: '100%',
                    }}
                >
                    {/* Header */}
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            position: 'relative',
                            mb: 2,
                            textAlign: 'center',
                            width: '100%',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '60%',
                                height: 3,
                                borderRadius: 1.5,
                                background: 'linear-gradient(90deg, #6C63FF, #887CFF)',
                            }
                        }}
                    >
                        {status} {items.length ? `(${items.length})` : ''}
                    </Typography>

                    {/* Task stack, scrolls vertically if overflow */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                            width: '100%',
                            overflowY: 'auto',
                            pr: 3,
                            '&::-webkit-scrollbar': { width: 6 },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(108,99,255,0.20)',
                                borderRadius: 3,
                            },
                            // This will ensure the scrollbar is "inside" the column but invisible until hovered.
                            '&:hover::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(108,99,255,0.40)',
                            }
                        }}
                    >
                        {items.length ? (
                            items.map(task => (
                                <Box
                                    key={task.id}
                                    onClick={() => onTaskClick(task)}
                                    sx={{
                                        mt: 2,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                        }
                                    }}
                                >
                                    <TaskCard task={task} />
                                </Box>
                            ))
                        ) : (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', mt: 4 }}
                            >
                                No tasks
                            </Typography>
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
