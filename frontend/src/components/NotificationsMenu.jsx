import React, { useEffect, useState, useCallback } from 'react';
import {
    Popover,
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Divider,
    Fade,
    Stack,
} from '@mui/material';
import { Circle, Check, BellOff } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { API } from '../api/axios';

dayjs.extend(relativeTime);

export default function NotificationsMenu({
    anchorEl,
    open,
    onClose,
    onUnreadChange,
}) {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState([]);

    const unreadCount = notes.filter(n => !n.read).length;

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.notification.get('/notifications/');
            setNotes(data || []);
        } catch (err) {
            console.error('Fetch notifications failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) fetchNotes();
    }, [open, fetchNotes]);

    useEffect(() => {
        onUnreadChange?.(unreadCount);
    }, [unreadCount, onUnreadChange]);

    const markRead = async (id) => {
        if (!id) return;
        setNotes(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
        onUnreadChange?.(unreadCount - 1);
        try {
            await API.notification.post(`/notifications/${id}/read`);
        } catch (err) {
            console.error('Mark-read failed', err);
        }
    };

    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
                sx: {
                    width: 350,
                    maxHeight: 440,
                    background: 'rgba(18,18,22,0.88)',
                    backdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 10px 36px rgba(0,0,0,0.4)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    p: 0,
                },
            }}
        >
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: '#ffffffdd',
                    }}
                >
                    Notifications
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {loading ? (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={22} />
                </Box>
            ) : notes.length === 0 ? (
                <Box
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        color: 'rgba(200,200,220,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.2,
                    }}
                >
                    <BellOff size={26} />
                    <Typography variant="body2" sx={{ fontSize: 13 }}>
                        You're all caught up!
                    </Typography>
                </Box>
            ) : (
                <List disablePadding sx={{
                    maxHeight: 370,
                    overflowY: 'auto',
                    px: 1,
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 4,
                    },
                }}>
                    {notes.map((n) => (
                        <ListItemButton
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            sx={{
                                alignItems: 'flex-start',
                                gap: 1.4,
                                py: 1.35,
                                px: 1.75,
                                mb: 0.25,
                                mt: n === notes[0] ? 0.75 : 0,  // ← ADD THIS
                                borderRadius: 3,
                                background: n.read
                                    ? 'transparent'
                                    : 'rgba(108,99,255,0.10)',
                                transition: 'background 0.2s ease',
                                '&:hover': {
                                    background: 'rgba(108,99,255,0.16)',
                                },
                            }}
                        >

                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#6C63FF',
                                    mt: '6px',
                                    opacity: n.read ? 0 : 1,
                                    transition: 'opacity 0.3s ease',
                                }}
                            />

                            <ListItemText
                                primary={n.message}
                                secondary={dayjs(n.created_at).fromNow()}
                                primaryTypographyProps={{
                                    sx: {
                                        fontSize: 14,
                                        color: '#f1f1f7',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden',
                                        wordBreak: 'break-word',
                                    },
                                }}
                                secondaryTypographyProps={{
                                    sx: {
                                        fontSize: 11.5,
                                        color: 'rgba(200,200,220,0.5)',
                                        mt: 0.5,
                                    },
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Popover>
    );
}
