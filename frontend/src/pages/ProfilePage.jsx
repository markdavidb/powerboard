// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    TextField,
    Button,
    Stack,
    Tooltip,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Save as SaveIcon, Key as KeyIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';
import { useAuth0 } from '@auth0/auth0-react';

export default function ProfilePage() {
    const { enqueueSnackbar } = useSnackbar();
    const { user, logout } = useAuth0();

    const [form, setForm] = useState({
        display_name: '',
        avatar_url: '',
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        API.user
            .get('/users/users/me')
            .then(res => {
                setForm({
                    display_name: res.data.display_name || '',
                    avatar_url: res.data.avatar_url || '',
                    bio: res.data.bio || '',
                });
            })
            .catch(() => {
                enqueueSnackbar('Failed to load profile', { variant: 'error' });
            })
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.user.put('/users/users/me', form);
            enqueueSnackbar('Profile updated ✨', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.detail || 'Update failed', {
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            const response = await API.user.post(
                '/users/users/password-change-ticket'
            );
            const ticketUrl = response.data.ticket;
            window.location.href = ticketUrl;
        } catch (err) {
            enqueueSnackbar(
                err.response?.data?.detail || 'Could not start password reset',
                {
                    variant: 'error',
                }
            );
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: '1200px', xl: '1440px' },
                minHeight: '88vh',
                mx: 'auto',
                mt: { xs: 1, md: 3 },
                boxSizing: 'border-box',
                backdropFilter: 'blur(18px)',
                background: theme => theme.palette.background.default,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                p: { xs: 1, sm: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {loading ? (
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress sx={{ color: '#6C63FF' }} />
                </Box>
            ) : (
                <>
                    {/* Title */}
                    <Box sx={{ flexGrow: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#fff',
                                    mb: 2,
                                    letterSpacing: '0.5px',
                                    textShadow: '0 0 12px rgba(108,99,255,0.35)',
                                }}
                            >
                                My Profile
                            </Typography>
                        </motion.div>

                        <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={4}
                        >
                            {/* Avatar & URL */}
                            <Stack
                                spacing={2}
                                alignItems="center"
                                sx={{ flex: '0 0 200px', textAlign: 'center' }}
                            >
                                <Box
                                    sx={{
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.05)' },
                                    }}
                                >
                                    <Avatar
                                        src={form.avatar_url || user.picture}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            border: '3px solid #6C63FF',
                                            boxShadow: '0 0 10px rgba(108,99,255,0.3)',
                                        }}
                                    />
                                </Box>
                                <Tooltip title="Paste a public image URL">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Avatar URL"
                                        variant="filled"
                                        value={form.avatar_url}
                                        onChange={e =>
                                            setForm({ ...form, avatar_url: e.target.value })
                                        }
                                        sx={{
                                            '& .MuiFilledInput-root': {
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: 2,
                                                color: '#fff',
                                            },
                                            '& .MuiInputLabel-root': { color: '#ccc' },
                                        }}
                                    />
                                </Tooltip>
                            </Stack>

                            {/* Name & Bio */}
                            <Stack spacing={2} flex={1}>
                                <TextField
                                    label="Display name"
                                    variant="filled"
                                    value={form.display_name}
                                    onChange={e =>
                                        setForm({ ...form, display_name: e.target.value })
                                    }
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                        '& .MuiFilledInput-root': {
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: 2,
                                            color: '#fff',
                                        },
                                        '& .MuiInputLabel-root': { color: '#ccc' },
                                    }}
                                />

                                <TextField
                                    label="Bio"
                                    multiline
                                    rows={3}
                                    variant="filled"
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                        '& .MuiFilledInput-root': {
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: 2,
                                            color: '#fff',
                                        },
                                        '& .MuiInputLabel-root': { color: '#ccc' },
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 3,
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            startIcon={<SaveIcon size={18} />}
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                px: 4,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                textTransform: 'none',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a50e0, #8e6cf1)',
                                },
                            }}
                        >
                            {saving ? 'Saving...' : 'Save changes'}
                        </Button>

                        <Button
                            startIcon={<KeyIcon size={18} />}
                            variant="outlined"
                            onClick={handleChangePassword}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: 'rgba(255,255,255,0.15)',
                                color: '#ddd',
                                '&:hover': {
                                    borderColor: '#6C63FF',
                                    background: 'rgba(108,99,255,0.05)',
                                    color: '#fff',
                                },
                            }}
                        >
                            Change password
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}
