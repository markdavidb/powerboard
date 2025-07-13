// src/components/ProjectSettingsModal.jsx

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Divider,
    TextField,
    Button,
    Stack,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    X as CloseIcon,
    Pencil as EditIcon,
    Trash2 as TrashIcon,
    Save as SaveIcon,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/axios';
import DeleteConfirmModal from './DeleteConfirmModal';
import ModernSelectMenu from './ModernSelectMenu';

const statusOptions = [
    { value: 'In Progress', label: 'In Progress', icon: Clock },
    { value: 'Done', label: 'Done', icon: CheckCircle }
];

const statusColors = {
    'In Progress': '#2196f3',
    'Done': '#4caf50'
};

const inputSx = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        '& fieldset': {
            borderColor: 'rgba(108,99,255,0.3)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(108,99,255,0.5)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6C63FF',
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        color: '#fff',
    },
    '& .MuiInputLabel-root': {
        color: '#bbb',
        '&.Mui-focused': {
            color: '#6C63FF',
        },
    },
    '& .MuiSelect-icon': {
        color: '#aaa',
    },
};

export default function ProjectSettingsModal({
                                                 open,
                                                 onClose,
                                                 projectId,
                                                 onProjectUpdated,
                                             }) {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [dueDate, setDueDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Status menu state
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);

    // Load project details each time modal opens
    useEffect(() => {
        if (!open) {
            // Reset editing state when modal closes
            setIsEditing(false);
            setStatusAnchorEl(null);
            return;
        }
        API.project
            .get(`/projects/${projectId}`)
            .then((res) => {
                const proj = res.data;
                setTitle(proj.title);
                setDescription(proj.description || '');
                setStatus(proj.status || 'In Progress');
                setDueDate(proj.due_date ? proj.due_date.split('T')[0] : '');
                setIsEditing(false); // Ensure editing is false when opening
                setDeleteOpen(false);
                setDeleting(false);
            })
            .catch((err) => {
                console.error(err);
                enqueueSnackbar('Failed to load project details.', { variant: 'error' });
            });
    }, [open, projectId, enqueueSnackbar]);

    // Save changes
    const handleSave = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const payload = {
                title: title.trim(),
                description,
                status,
                due_date: dueDate || null,
            };
            const res = await API.project.put(`/projects/${projectId}`, payload);
            onProjectUpdated?.(res.data);
            enqueueSnackbar('Project updated successfully.', { variant: 'success' });
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Failed to update project.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Delete project
    const handleDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await API.project.delete(`/projects/${projectId}`);
            enqueueSnackbar('Project deleted.', { variant: 'success' });
            navigate('/projects', { replace: true });
        } catch (err) {
            const detail =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Failed to delete project.';
            enqueueSnackbar(detail, { variant: 'error' });
            console.error('Delete project error:', err);
            setDeleting(false);
        }
    };

    const handleClose = () => {
        setIsEditing(false);
        setStatusAnchorEl(null);
        onClose();
    };

    const handleCancel = () => {
        setIsEditing(false);
        setStatusAnchorEl(null);
        // Reset form data to original values
        if (open && projectId) {
            API.project
                .get(`/projects/${projectId}`)
                .then((res) => {
                    const proj = res.data;
                    setTitle(proj.title);
                    setDescription(proj.description || '');
                    setStatus(proj.status || 'In Progress');
                    setDueDate(proj.due_date ? proj.due_date.split('T')[0] : '');
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose} // Use handleClose instead of onClose directly
                container={undefined}
                closeAfterTransition
                BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '95%', sm: '90%', md: 500 },
                            maxWidth: { xs: '100vw', sm: '500px', md: '500px' },
                            bgcolor: 'rgba(28, 28, 32, 0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108,99,255,0.1)',
                            borderRadius: 3,
                            outline: 'none',
                            p: 0,
                            maxHeight: { xs: '85vh', md: '90vh' },
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: { xs: 2, md: 3 },
                            pb: { xs: 1.5, md: 2 },
                            background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(147,115,255,0.04))',
                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <Typography variant="h5" sx={{
                                fontWeight: 600,
                                fontSize: { xs: '1.2rem', md: '1.5rem' },
                                color: '#fff',
                                background: 'linear-gradient(135deg, #6C63FF, #9B73FF)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Project Settings
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {!isEditing && (
                                    <Tooltip title="Edit Project">
                                        <IconButton
                                            onClick={() => setIsEditing(true)}
                                            sx={{
                                                color: '#aaa',
                                                p: { xs: 1, md: 1 },
                                                '&:hover': {
                                                    color: '#6C63FF',
                                                    backgroundColor: 'rgba(108,99,255,0.1)'
                                                }
                                            }}
                                        >
                                            <EditIcon size={18} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete Project">
                                    <IconButton
                                        onClick={() => setDeleteOpen(true)}
                                        sx={{
                                            color: '#aaa',
                                            p: { xs: 1, md: 1 },
                                            '&:hover': {
                                                color: '#FF5555',
                                                backgroundColor: 'rgba(255,85,85,0.1)'
                                            }
                                        }}
                                    >
                                        <TrashIcon size={18} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Close">
                                    <IconButton
                                        onClick={handleClose} // Use handleClose instead of onClose
                                        sx={{
                                            color: '#aaa',
                                            p: { xs: 1, md: 1 },
                                            '&:hover': {
                                                color: '#fff',
                                                backgroundColor: 'rgba(255,255,255,0.1)'
                                            }
                                        }}
                                    >
                                        <CloseIcon size={18} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Body */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
                            {isEditing ? (
                                <Stack spacing={{ xs: 2, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        sx={inputSx}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        multiline
                                        minRows={4}
                                        sx={inputSx}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />

                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 2,
                                        alignItems: 'end' // This ensures both elements align at the bottom
                                    }}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Due Date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            InputLabelProps={{
                                                shrink: true,
                                                sx: { color: '#bbb' },
                                            }}
                                            sx={inputSx}
                                        />

                                        <Box>
                                            <Typography variant="body2" sx={{
                                                color: '#bbb',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                mb: 0.5,
                                                ml: 1
                                            }}>
                                                Status
                                            </Typography>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                onClick={(e) => setStatusAnchorEl(e.currentTarget)}
                                                disabled={loading}
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    textTransform: 'none',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    borderColor: 'rgba(108,99,255,0.3)',
                                                    color: '#fff',
                                                    py: 1.75, // Increased padding to match TextField height
                                                    minHeight: '56px', // Explicit height to match TextField
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                                        borderColor: 'rgba(108,99,255,0.5)',
                                                    }
                                                }}
                                            >
                                                {statusOptions.find(opt => opt.value === status)?.label || status}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Stack>
                            ) : (
                                <Box sx={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 2,
                                    p: { xs: 2, md: 3 },
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
                                            gap: { xs: 1, sm: 2 },
                                            alignItems: 'start'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#888',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                letterSpacing: '0.5px'
                                            }}>
                                                Title
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#fff',
                                                fontWeight: 500,
                                                lineHeight: 1.5,
                                                fontSize: { xs: '0.9rem', md: '1rem' }
                                            }}>
                                                {title}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
                                            gap: { xs: 1, sm: 2 },
                                            alignItems: 'start'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#888',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                letterSpacing: '0.5px'
                                            }}>
                                                Description
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#e0e0e0',
                                                lineHeight: 1.6,
                                                whiteSpace: 'pre-wrap',
                                                fontSize: { xs: '0.8rem', md: '0.875rem' }
                                            }}>
                                                {description || 'No description provided'}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                            gap: { xs: 2, sm: 3 }
                                        }}>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#888',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                    letterSpacing: '0.5px',
                                                    mb: 0.5
                                                }}>
                                                    Due Date
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#e0e0e0',
                                                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                                                }}>
                                                    {dueDate || 'No due date'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#888',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                    letterSpacing: '0.5px',
                                                    mb: 0.5
                                                }}>
                                                    Status
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: statusColors[status] || '#e0e0e0',
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                                                }}>
                                                    {status}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        {/* Footer - only in edit mode */}
                        {isEditing && (
                            <Box sx={{
                                p: { xs: 2, md: 3 },
                                pt: { xs: 1.5, md: 2 },
                                background: 'rgba(255,255,255,0.02)',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                gap: { xs: 1.5, sm: 2 }
                            }}>
                                <Button
                                    onClick={handleCancel} // Use handleCancel instead of inline function
                                    variant="outlined"
                                    fullWidth={{ xs: true, sm: false }}
                                    sx={{
                                        color: '#ddd',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        px: 3,
                                        order: { xs: 2, sm: 1 },
                                        '&:hover': {
                                            borderColor: '#fff',
                                            backgroundColor: 'rgba(255,255,255,0.05)'
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    variant="contained"
                                    startIcon={!loading && <SaveIcon size={16} />}
                                    disabled={loading}
                                    fullWidth={{ xs: true, sm: false }}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: { xs: 3, md: 4 },
                                        background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                        boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                                        order: { xs: 1, sm: 2 },
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 16px rgba(108,99,255,0.4)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(108,99,255,0.3)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {loading ? <CircularProgress color="inherit" size={20} /> : 'Save Changes'}
                                </Button>
                            </Box>
                        )}

                        {/* Status Select Menu */}
                        <ModernSelectMenu
                            open={Boolean(statusAnchorEl)}
                            anchorEl={statusAnchorEl}
                            onClose={() => setStatusAnchorEl(null)}
                            value={status}
                            onChange={setStatus}
                            options={statusOptions}
                            title="Select Status"
                        />
                    </Box>
                </Fade>
            </Modal>

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDelete}
                loading={deleting}
                title="Delete this project?"
                subtitle="This action can't be undone and all project data will be removed."
            />
        </>
    );
}
