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
    IconButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';
import { Plus, X, Crown } from 'lucide-react'; // Import icons

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
    bgcolor: 'rgba(28, 28, 32, 0.75)', // Slightly more transparent
    backdropFilter: 'blur(8px)', // Reduced blur
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)', // Softer shadow
    p: { xs: 2, sm: 3 },
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
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }} // Removed dark backdrop
            >
                <Box sx={modalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                        Epic Members
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Plus size={16} />}
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

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1, mt: 1 }} />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} sx={{ color: '#6C63FF' }} />
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto', p: 0 }}>
                            {/* Owner first */}
                            {ownerUsername && (
                                <ListItem sx={{
                                    bgcolor: 'rgba(108,99,255,0.1)',
                                    borderRadius: 2,
                                    mb: 1
                                }}>
                                    <ListItemText
                                        primary={ownerUsername}
                                        primaryTypographyProps={{ color: '#fff', fontWeight: 600 }}
                                    />
                                    <Chip
                                        icon={<Crown size={14} />}
                                        label="Owner"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#6C63FF',
                                            color: '#fff',
                                            fontWeight: 500,
                                        }}
                                    />
                                </ListItem>
                            )}

                            {/* Members (excluding owner) */}
                            {members
                                .filter((m) => m.username !== ownerUsername)
                                .map((m, i) => (
                                    <ListItem
                                        key={i}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.05)'
                                            }
                                        }}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => removeMember(m.username)}
                                            >
                                                <X size={16} color="#FF5555" />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={m.username}
                                            primaryTypographyProps={{ color: '#e0e0e0' }}
                                        />
                                    </ListItem>
                                ))}

                            {!members.length && !ownerUsername && (
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
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }} // Removed dark backdrop
            >
                <Box sx={addModalSx}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                        Add Member
                    </Typography>

                    <TextField
                        label="Username"
                        fullWidth
                        variant="outlined" // Ensure variant is set
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
