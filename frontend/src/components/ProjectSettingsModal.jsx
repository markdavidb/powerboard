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
    MenuItem,
    Button,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    X as CloseIcon,
    Pencil as EditIcon,
    Trash2 as TrashIcon,
    Save as SaveIcon,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/axios';
import DeleteConfirmModal from './DeleteConfirmModal';

const STATUS_OPTIONS = ['In Progress', 'Done'];

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

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load project details each time modal opens
    useEffect(() => {
        if (!open) return;
        API.project
            .get(`/projects/${projectId}`)
            .then((res) => {
                const proj = res.data;
                setTitle(proj.title);
                setDescription(proj.description || '');
                setStatus(proj.status || 'In Progress');
                setDueDate(proj.due_date ? proj.due_date.split('T')[0] : '');
                setIsEditing(false);
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
            onClose();
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Failed to update project.', { variant: 'error' });
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

    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
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
                            width: { xs: '90vw',  sm: 500 },
                            bgcolor: 'rgba(24,24,30,0.85)',
                            backdropFilter: 'blur(24px)',
                            border: '1.5px solid rgba(108,99,255,0.6)',
                            boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
                            borderRadius: 2,
                            outline: 'none',
                            p: 3,
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            <Typography variant="h6" color="text.primary">
                                Project Settings
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {!isEditing && (
                                    <IconButton
                                        onClick={() => setIsEditing(true)}
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        <EditIcon size={20} />
                                    </IconButton>
                                )}
                                <IconButton
                                    onClick={() => setDeleteOpen(true)}
                                    sx={{ color: 'rgba(242,87,87)' }}
                                >
                                    <TrashIcon size={20} />
                                </IconButton>
                                <IconButton
                                    onClick={onClose}
                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                    <CloseIcon size={20} />
                                </IconButton>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', mb: 2 }} />

                        {/* Form */}
                        <Box
                            component="form"
                            onSubmit={handleSave}
                            sx={{ flex: 1, overflowY: 'auto',p:1 }}
                        >
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!isEditing}
                                    InputProps={{ sx: { color: '#fff' } }}
                                    InputLabelProps={{ sx: { color: '#bbb' } }}
                                    sx={inputSx}
                                />

                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    minRows={3}
                                    disabled={!isEditing}
                                    InputProps={{ sx: { color: '#fff' } }}
                                    InputLabelProps={{ sx: { color: '#bbb' } }}
                                    sx={inputSx}
                                />

                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={!isEditing}
                                    InputProps={{ sx: { color: '#fff' } }}
                                    InputLabelProps={{ sx: { color: '#bbb' } }}
                                    sx={inputSx}
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Due Date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={!isEditing}
                                    InputProps={{ sx: { color: '#fff' } }}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: { color: '#bbb' },
                                    }}
                                    sx={inputSx}
                                />
                            </Stack>

                            {isEditing && (
                                <>
                                    <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<SaveIcon size={16} />}
                                            sx={{
                                                background: 'linear-gradient(135deg,#6C63FF,#8A78FF)',
                                                color: '#fff',
                                                textTransform: 'none',
                                                boxShadow: '0 2px 3px rgba(108,99,255,0.4)',
                                                '&:hover': {
                                                    background:
                                                        'linear-gradient(135deg,#5b54e6,#7b68ff)',
                                                },
                                            }}
                                        >
                                            Save Changes
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDelete}
                loading={deleting}
                title="Delete this project?"
                subtitle="This action can’t be undone and all project data will be removed."
            />
        </>
    );
}
