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
  IconButton,
  Button
} from '@mui/material';
import { BellOff, X } from 'lucide-react';
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
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    onUnreadChange?.(unreadCount - 1);
    try {
      await API.notification.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Mark-read failed', err);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notes.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    // Optimistically update UI
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
    onUnreadChange?.(0);
    try {
      await API.notification.post('/notifications/read_all');
    } catch (err) {
      // Optionally: revert UI if failed
      console.error('Mark all as read failed', err);
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
          width: { xs: '90vw', sm: 360 },
          maxHeight: 480,
          background: 'rgba(18,18,22,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          borderRadius: 4,
          p: 0,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0
      }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: 14.5,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: '#ffffffdd',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="small"
              sx={{
                fontSize: 12,
                px: 1.5,
                py: 0.3,
                mr: { xs: 0.3, sm: 0.8 },
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                background: 'rgba(108,99,255,0.23)',
                boxShadow: 'none',
                minWidth: 0,
                transition: 'background 0.18s',
                '&:hover': {
                  background: 'rgba(108,99,255,0.38)',
                },
              }}
            >
              Mark all as read
            </Button>
          )}
          <IconButton onClick={onClose} size="small" sx={{ color: '#aaa', ml: 0.5 }}>
            <X size={18} />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Body */}
      {loading ? (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={22} sx={{ color: '#6C63FF' }} />
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
        <List
          disablePadding
          sx={{
            maxHeight: 390,
            overflowY: 'auto',
            px: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4,
            },
          }}
        >
          {notes.map((n, i) => (
            <ListItemButton
              key={n.id}
              onClick={() => markRead(n.id)}
              sx={{
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.35,
                px: 2,
                mb: 0.25,
                mt: i === 0 ? 1 : 0,
                borderRadius: 3,
                background: n.read ? 'transparent' : 'rgba(108,99,255,0.10)',
                transition: 'background 0.2s ease',
                '&:hover': {
                  background: 'rgba(108,99,255,0.15)',
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
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={n.message}
                secondary={dayjs(n.created_at).fromNow()}
                primaryTypographyProps={{
                  sx: {
                    fontSize: 14,
                    color: '#f1f1f7',
                    lineHeight: 1.45,
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
