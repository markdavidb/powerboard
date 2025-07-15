// src/components/ProjectMembersModal.jsx
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Chip,
    IconButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth0 } from '@auth0/auth0-react';
import { API } from '../api/axios';

/* ─────────────── Shared design tokens (matching BigTaskMembersModal) ─────────────── */
const inputSx = {
    bgcolor: 'rgba(255,255,255,0.05)',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(108,99,255,0.3)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(108,99,255,0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6C63FF',
    },
    '& .MuiInputBase-input': {
        color: '#fff',
    },
};

const modalSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    maxHeight: '80vh',
    bgcolor: 'rgba(28, 28, 32, 0.75)', // Glass morphism effect
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    p: { xs: 2, sm: 3 },
    display: 'flex',
    flexDirection: 'column',
};

const addModalSx = {
    ...modalSx,
    width: { xs: '80%', sm: 360 },
};

const ROLE_OPTIONS = ['owner', 'editor', 'viewer'];

export default function ProjectMembersModal({ open, onClose, projectId, container }) {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth0();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [adding, setAdding] = useState(false);

    const currentUsername =
        user?.nickname || user?.preferred_username || user?.name || '';

    const isOwner = members.some(
        (m) => m.role === 'owner' && (m.username || m.user?.username) === currentUsername
    );

    /* ─── Load members on open ────────────────────────────────────────── */
    useEffect(() => {
        if (!open) return;
        (async () => {
            setLoading(true);
            try {
                const { data } = await API.project.get(
                    `/projects/members/${projectId}/members`
                );
                setMembers(data);
            } catch (err) {
                enqueueSnackbar('Failed to load members', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        })();
    }, [open, projectId]);

    /* ─── Add member ─────────────────────────────────────────────────────────── */
    const addMember = async () => {
        if (!newUsername.trim() || adding) return;
        setAdding(true);
        try {
            const payload = { username: newUsername.trim(), role: newRole, project_id: projectId };
            const { data } = await API.project.post('/projects/members/', payload);
            setMembers((prev) => [...prev, data]);
            enqueueSnackbar(`Added ${data.username || newUsername}`, { variant: 'success' });
            setShowAdd(false);
            setNewUsername('');
            setNewRole('viewer');
        } catch (err) {
            enqueueSnackbar('Error adding member', { variant: 'error' });
        } finally {
            setAdding(false);
        }
    };

    /* ─── Remove member ───────────────────────────────────────────────────────── */
    const removeMember = async (username) => {
        try {
            await API.project.delete(
                `/projects/members/${projectId}/members/${username}`
            );
            setMembers((prev) => prev.filter((m) => (m.username || m.user?.username) !== username));
            enqueueSnackbar(`Removed ${username}`, { variant: 'success' });
        } catch {
            enqueueSnackbar('Error removing member', { variant: 'error' });
        }
    };

    /* ─── Get role color ─────────────────────────────────────────────────────── */
    const getRoleColor = (role) => {
        switch (role) {
            case 'owner':
                return '#6C63FF';
            case 'editor':
                return '#4CAF50';
            case 'viewer':
                return '#FF9800';
            default:
                return '#FF9800';
        }
    };

    /* ─── Main modal ─────────────────────────────────────────────────────────── */
    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                container={container}
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
            >
                <Box sx={modalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                        Project Members
                    </Typography>

                    {isOwner && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => setShowAdd(true)}
                            sx={{
                                mb: 2,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                }
                            }}
                        >
                            Add Member
                        </Button>
                    )}

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1, mt: 1 }} />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} sx={{ color: '#6C63FF' }} />
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto', p: 0 }}>
                            {members.length ? (
                                members
                                    .sort((a, b) => {
                                        // Sort owners first, then by role
                                        if (a.role === 'owner') return -1;
                                        if (b.role === 'owner') return 1;
                                        return 0;
                                    })
                                    .map((m, i) => {
                                        const username = m.username || m.user?.username;
                                        const isCurrentOwner = m.role === 'owner';

                                        return (
                                            <ListItem
                                                key={i}
                                                sx={{
                                                    bgcolor: isCurrentOwner ? 'rgba(108,99,255,0.1)' : 'transparent',
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    '&:hover': {
                                                        bgcolor: isCurrentOwner ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)'
                                                    }
                                                }}
                                                secondaryAction={
                                                    isCurrentOwner ? (
                                                        <Chip
                                                            label="Owner"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: getRoleColor(m.role),
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={m.role}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getRoleColor(m.role),
                                                                    color: '#fff',
                                                                    fontWeight: 500,
                                                                    textTransform: 'capitalize',
                                                                }}
                                                            />
                                                            {isOwner && (
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => removeMember(username)}
                                                                    sx={{ textTransform: 'none', color: '#FF5555', minWidth: 'auto' }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    )
                                                }
                                            >
                                                <ListItemText
                                                    primary={username}
                                                    primaryTypographyProps={{
                                                        color: isCurrentOwner ? '#fff' : '#e0e0e0',
                                                        fontWeight: isCurrentOwner ? 600 : 400
                                                    }}
                                                />
                                            </ListItem>
                                        );
                                    })
                            ) : (
                                <Typography textAlign="center" sx={{ color: '#aaa', p: 2 }}>
                                    No members yet.
                                </Typography>
                            )}
                        </List>
                    )}
                </Box>
            </Modal>

            {/* ─── Add-member pop-up ─────────────────────────────────────────────── */}
            <Modal
                open={showAdd}
                onClose={() => setShowAdd(false)}
                container={container}
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
            >
                <Box sx={addModalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                        Add Member
                    </Typography>

                    <TextField
                        label="Username"
                        fullWidth
                        variant="outlined"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        sx={{ ...inputSx, mb: 2 }}
                        InputLabelProps={{ sx: { color: '#bbb' } }}
                    />

                    <FormControl fullWidth sx={{ ...inputSx, mb: 2 }}>
                        <InputLabel sx={{ color: '#bbb' }}>Role</InputLabel>
                        <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            label="Role"
                        >
                            {ROLE_OPTIONS.filter(role => role !== 'owner').map((role) => (
                                <MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={addMember}
                            disabled={adding || !newUsername.trim()}
                            sx={{
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                }
                            }}
                        >
                            {adding ? 'Adding…' : 'Add'}
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowAdd(false)}
                            disabled={adding}
                            sx={{
                                textTransform: 'none',
                                borderColor: 'rgba(255,255,255,0.3)',
                                color: '#fff',
                                '&:hover': {
                                    borderColor: '#6C63FF',
                                    bgcolor: 'rgba(108,99,255,0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}
