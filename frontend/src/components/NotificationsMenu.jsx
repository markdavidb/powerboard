// src/components/NotificationsMenu.jsx
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
} from '@mui/material';
import { Circle, Check, BellOff } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { API } from '../api/axios';

dayjs.extend(relativeTime);

/**
 * • Fetches notifications for the current user when opened.
 * • Marks a notification as read when the row is clicked.
 * • Notifies parent when unread count changes (so the badge can update).
 */
export default function NotificationsMenu({
                                              anchorEl,
                                              open,
                                              onClose,
                                              onUnreadChange,
                                          }) {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes]     = useState([]);

    const unreadCount = notes.filter(n => !n.read).length;

    // ───────────────────────────────────────────────────────── fetch
    const fetchNotes = useCallback(async () => {
        console.log('[NotificationsMenu] fetchNotes() called; open=', open);
        setLoading(true);
        try {
            const { data } = await API.notification.get('/notifications/');
            setNotes(data || []);
        } catch (err) {
            console.error('Fetch notifications failed:', err);
        } finally {
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (open) fetchNotes();
    }, [open, fetchNotes]);

    // let Header.jsx know when unread count changed
    useEffect(() => {
        onUnreadChange?.(unreadCount);
    }, [unreadCount, onUnreadChange]);

    // ───────────────────────────────────────────── mark single note read
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

    // ───────────────────────────────────────────────────────────── view
    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
                sx: {
                    width: 340,
                    maxHeight: 420,
                    background: 'rgba(24,24,30,0.82)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            <Box sx={{ p: 2, pb: 0 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: '#fff' }}
                >
                    Notifications
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            {loading ? (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                </Box>
            ) : notes.length === 0 ? (
                <Box
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        color: 'rgba(200,200,220,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <BellOff size={20} />
                    <Typography variant="body2">No notifications</Typography>
                </Box>
            ) : (
                <List disablePadding sx={{ maxHeight: 370, overflow: 'auto' }}>
                    {notes.map((n) => (
                        <ListItemButton
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            sx={{
                                alignItems: 'flex-start',
                                gap: 1.25,
                                background: n.read
                                    ? 'transparent'
                                    : 'rgba(108,99,255,0.10)',
                                '&:hover': {
                                    background: 'rgba(108,99,255,0.18)',
                                },
                            }}
                        >
                            {/* unread dot */}
                            {n.read ? (
                                <Check size={10} style={{ marginTop: 6, opacity: 0 }} />
                            ) : (
                                <Circle
                                    size={10}
                                    style={{ marginTop: 6, color: '#6C63FF' }}
                                />
                            )}

                            <ListItemText
                                primary={n.message}
                                secondary={dayjs(n.created_at).fromNow()}
                                primaryTypographyProps={{
                                    sx: {
                                        fontSize: 14,
                                        color: '#f4f5fa',
                                        // clamp to max two lines with ellipsis
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden',
                                        wordBreak: 'break-word',
                                    },
                                }}
                                secondaryTypographyProps={{
                                    sx: {
                                        fontSize: 12,
                                        color: 'rgba(200,200,220,0.6)',
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
