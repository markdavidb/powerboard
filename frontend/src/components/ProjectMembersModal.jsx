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
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth0 } from '@auth0/auth0-react';
import { API } from '../api/axios';

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
    width: { xs: '90vw',  sm: 500 },
    maxHeight: '80vh',
    bgcolor: '#18181E',
    border: '1px solid #6C63FF',
    boxShadow: '0 4px 28px rgba(0,0,0,0.3)',
    borderRadius: 2,
    color: '#fff',
    p: 3,
    display: 'flex',
    flexDirection: 'column',
};

const addModalSx = {
    ...modalSx,
    width: { xs: '80vw', sm: 360 },
};

const ROLE_OPTIONS = ['owner', 'editor', 'viewer'];

export default function ProjectMembersModal({ open, onClose, projectId }) {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth0();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [removing, setRemoving] = useState(false);

    const currentUsername =
        user?.nickname || user?.preferred_username || user?.name || '';

    const isOwner = members.some(
        (m) => m.role === 'owner' && (m.username || m.user?.username) === currentUsername
    );

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

    const addMember = async () => {
        if (!newUsername.trim()) return;
        try {
            const payload = { username: newUsername, role: newRole, project_id: projectId };
            const { data } = await API.project.post('/projects/members/', payload);
            setMembers((prev) => [...prev, data]);
            enqueueSnackbar(`Added ${newUsername}`, { variant: 'success' });
            setNewUsername('');
            setShowAdd(false);
        } catch (err) {
            enqueueSnackbar('Error adding member', { variant: 'error' });
        }
    };

    const removeMember = async (username) => {
        if (removing) return;
        setRemoving(true);
        try {
            await API.project.delete(
                `/projects/members/${projectId}/members/${username}`
            );
            setMembers((prev) => prev.filter((m) => (m.username || m.user?.username) !== username));
            enqueueSnackbar(`Removed ${username}`, { variant: 'success' });
        } catch {
            enqueueSnackbar('Error removing member', { variant: 'error' });
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
            >
                <Box sx={modalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                        Project Members
                    </Typography>

                    {isOwner && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => setShowAdd(true)}
                            sx={{ mb: 2, textTransform: 'none', backgroundColor: '#6C63FF' }}
                        >
                            Add Member
                        </Button>
                    )}

                    <Divider sx={{ borderColor: '#6C63FF', mb: 2 }} />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} sx={{ color: '#ccc' }} />
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto' }}>
                            {members.length ? (
                                members.map((m, i) => {
                                    const username = m.username || m.user?.username;
                                    return (
                                        <ListItem
                                            key={i}
                                            secondaryAction={
                                                m.role === 'owner' ? (
                                                    <Chip label="Owner" size="small" sx={{ backgroundColor: '#6C63FF', color: '#fff' }} />
                                                ) : (
                                                    isOwner && (
                                                        <Button
                                                            size="small"
                                                            onClick={() => removeMember(username)}
                                                            disabled={removing}
                                                            sx={{ textTransform: 'none', color: '#FF5555' }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={username}
                                                secondary={`Role: ${m.role}`}
                                                primaryTypographyProps={{ color: '#fff' }}
                                                secondaryTypographyProps={{ color: '#ccc' }}
                                            />
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <Typography textAlign="center" sx={{ color: '#aaa' }}>
                                    No members yet.
                                </Typography>
                            )}
                        </List>
                    )}
                </Box>
            </Modal>

            <Modal
                open={showAdd}
                onClose={() => setShowAdd(false)}
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
            >
                <Box sx={addModalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                        Add Member
                    </Typography>

                    <TextField
                        label="Username"
                        fullWidth
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        sx={{ ...inputSx, mb: 2 }}
                        InputLabelProps={{ sx: { color: '#bbb' } }}
                    />

                    <FormControl fullWidth sx={{ ...inputSx, mb: 2 }}>
                        <InputLabel sx={{ color: '#bbb' }}>Role</InputLabel>
                        <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
                            {ROLE_OPTIONS.map((r) => (
                                <MenuItem key={r} value={r}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={addMember}
                            sx={{ textTransform: 'none', backgroundColor: '#6C63FF' }}
                        >
                            Add
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowAdd(false)}
                            sx={{ textTransform: 'none', borderColor: '#6C63FF', color: '#6C63FF' }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}
