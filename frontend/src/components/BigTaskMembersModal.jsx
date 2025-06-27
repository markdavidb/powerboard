// src/components/BigTaskMembersModal.jsx
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
    Divider,
    Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';

/* ─────────────── Shared design tokens (copied from ProjectMembersModal) ─────────────── */
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
    width: { xs: '80%', sm: 360 },
};

/* ────────────────────────────────────────────────────────────────────────────── */

export default function BigTaskMembersModal({ open, onClose, bigTaskId, container }) {
    const { enqueueSnackbar } = useSnackbar();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [adding, setAdding] = useState(false);
    const [ownerUsername, setOwnerUsername] = useState(null);

    /* ─── Load members + owner on open ────────────────────────────────────────── */
    useEffect(() => {
        if (!open) return;
        (async () => {
            setLoading(true);
            try {
                const [mRes, taskRes] = await Promise.all([
                    API.project.get(`/projects/big_task_members/big_task_members/${bigTaskId}/members`),
                    API.project.get(`/projects/big_tasks/big_tasks/${bigTaskId}`),
                ]);

                const projectId = taskRes.data.project_id;
                const projRes = await API.project.get(`/projects/${projectId}`);

                setMembers(mRes.data);
                setOwnerUsername(projRes.data.owner.username);
            } catch {
                enqueueSnackbar('Failed to load members', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        })();
    }, [open, bigTaskId]);

    /* ─── Add member ─────────────────────────────────────────────────────────── */
    const addMember = async () => {
        if (!newUsername.trim() || adding) return;
        setAdding(true);
        try {
            const { data } = await API.project.post('/projects/big_task_members/big_task_members/', {
                big_task_id: bigTaskId,
                username: newUsername.trim(),
            });
            setMembers((prev) => [...prev, data]);
            enqueueSnackbar(`Added ${data.username}`, { variant: 'success' });
            setShowAdd(false);
            setNewUsername('');
        } catch {
            enqueueSnackbar('Error adding member', { variant: 'error' });
        } finally {
            setAdding(false);
        }
    };

    /* ─── Remove member ───────────────────────────────────────────────────────── */
    const removeMember = async (username) => {
        try {
            await API.project.delete(
                `/projects/big_task_members/big_task_members/${bigTaskId}/members/${username}`,
            );
            setMembers((prev) => prev.filter((m) => m.username !== username));
            enqueueSnackbar(`Removed ${username}`, { variant: 'success' });
        } catch {
            enqueueSnackbar('Error removing member', { variant: 'error' });
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
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                        Epic Members
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowAdd(true)}
                        sx={{ mb: 2, textTransform: 'none', backgroundColor: '#6C63FF' }}
                    >
                        Add Member
                    </Button>

                    <Divider sx={{ borderColor: '#6C63FF', mb: 2 }} />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} sx={{ color: '#ccc' }} />
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto' }}>
                            {/* Owner first */}
                            {ownerUsername && (
                                <ListItem>
                                    <ListItemText
                                        primary={ownerUsername}
                                        primaryTypographyProps={{ color: '#fff', fontWeight: 700 }}
                                    />
                                    <Chip
                                        label="Owner"
                                        size="small"
                                        sx={{ backgroundColor: '#6C63FF', color: '#fff' }}
                                    />
                                </ListItem>
                            )}

                            {/* Members (excluding owner) */}
                            {members
                                .filter((m) => m.username !== ownerUsername)
                                .map((m, i) => (
                                    <ListItem
                                        key={i}
                                        secondaryAction={
                                            <Button
                                                size="small"
                                                onClick={() => removeMember(m.username)}
                                                sx={{ textTransform: 'none', color: '#FF5555' }}
                                            >
                                                Remove
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={m.username}
                                            primaryTypographyProps={{ color: '#fff' }}
                                        />
                                    </ListItem>
                                ))}

                            {!members.length && !ownerUsername && (
                                <Typography textAlign="center" sx={{ color: '#aaa' }}>
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

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={addMember}
                            disabled={adding || !newUsername.trim()}
                            sx={{ textTransform: 'none', backgroundColor: '#6C63FF' }}
                        >
                            {adding ? 'Adding…' : 'Add'}
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowAdd(false)}
                            disabled={adding}
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
