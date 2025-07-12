// src/components/board/JiraTaskBoard.jsx
import React, { useState } from 'react';
import { Box, Typography, useTheme, Tabs, Tab, useMediaQuery } from '@mui/material';
import TaskCard from './TaskCard';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

export default function JiraTaskBoard({ tasks = [], onTaskClick }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedTab, setSelectedTab] = useState(0);

    // group tasks by status
    const buckets = STATUSES.map(status => ({
        status,
        items: tasks.filter(t => t.status === status),
    }));

    if (isMobile) {
        // Mobile: Tab-based view
        return (
            <Box sx={{ width: '100%', height: '100%' }}>
                {/* Tab Headers */}
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, newValue) => setSelectedTab(newValue)}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 400,
                                fontSize: '0.70rem', // Slightly larger than 0.6rem for better readability
                                minHeight: 30, // Reduce tab height slightly
                                py: 1,
                                '&.Mui-selected': {
                                    color: '#6C63FF',
                                    fontWeight: 400,
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#6C63FF',
                                height: 3,
                            },
                        }}
                    >
                        {buckets.map(({ status, items }, index) => (
                            <Tab
                                key={status}
                                label={`${status} (${items.length})`}
                                sx={{ minWidth: 0 }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box
                    sx={{
                        flex: 1,
                        p: 2,
                        overflowY: 'auto',
                        height: 'calc(100% - 48px)', // Subtract tab height
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(108,99,255,0.3)',
                            borderRadius: 3,
                        },
                    }}
                >
                    {buckets[selectedTab] && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {buckets[selectedTab].items.length ? (
                                buckets[selectedTab].items.map(task => (
                                    <Box
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        sx={{
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
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
                                    No tasks in {buckets[selectedTab].status}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    // Desktop: Original column-based view
    return (
        <Box
            sx={{
                ml: 2,
                display: 'flex',
                gap: 2,
                p: 2,
                overflowX: 'auto',
                height: '60vh',
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
                        minWidth: 320,
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
                        variant="subtitle2"
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', md: '0.9rem' }, // Smaller, more appropriate size
                            position: 'relative',
                            mb: 2,
                            textAlign: 'center',
                            width: '100%',
                            letterSpacing: '0.02em',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '60%',
                                height: 2, // Slightly thinner line
                                borderRadius: 1,
                                background: 'linear-gradient(90deg, #6C63FF, #887CFF)',
                            }
                        }}
                    >
                        {status} {items.length ? `(${items.length})` : ''}
                    </Typography>

                    {/* Task stack */}
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
