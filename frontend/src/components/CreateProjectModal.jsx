// src/components/CreateProjectModal.jsx

import React, { useState } from 'react';
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
import { X as CloseIcon, Plus as PlusIcon, CheckCircle, Clock } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';
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

export default function CreateProjectModal({
    open,
    onClose,
    onProjectCreated,
    container,
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [dueDate, setDueDate] = useState('');
    const [titleError, setTitleError] = useState('');
    const [loading, setLoading] = useState(false);

    // Status menu state
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStatus('In Progress');
        setDueDate('');
        setTitleError('');
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleCreate = async e => {
        e.preventDefault();
        if (!title.trim()) {
            setTitleError('Title is required');
            return;
        }
        if (loading) return;

        setTitleError('');
        setLoading(true);

        try {
            const res = await API.project.post('/projects/', {
                title: title.trim(),
                description,
                status,
                due_date: dueDate || null,
            });
            onProjectCreated(res.data);
            enqueueSnackbar('Project created successfully!', { variant: 'success' });
            handleClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Failed to create project. Please try again.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            container={container}
            closeAfterTransition
            BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
        >
            <Fade in={open}>
                <Box
                    component="form"
                    onSubmit={handleCreate}
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
                            Create New Project
                        </Typography>
                        <Tooltip title="Close">
                            <IconButton
                                onClick={handleClose}
                                disabled={loading}
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

                    {/* Body */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
                        <Stack spacing={{ xs: 2, md: 3 }}>
                            <TextField
                                fullWidth
                                required
                                label="Project Title"
                                value={title}
                                onChange={e => {
                                    setTitle(e.target.value);
                                    if (e.target.value.trim()) setTitleError('');
                                }}
                                error={!!titleError}
                                helperText={titleError}
                                sx={inputSx}
                                disabled={loading}
                                InputLabelProps={{ sx: { color: '#bbb' } }}
                            />

                            <TextField
                                fullWidth
                                label="Project Description"
                                multiline
                                minRows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                sx={inputSx}
                                disabled={loading}
                                InputLabelProps={{ sx: { color: '#bbb' } }}
                            />

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 2
                            }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Due Date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: { color: '#bbb' }
                                    }}
                                    sx={inputSx}
                                    disabled={loading}
                                />

                                <Box sx={{ position: 'relative' }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            left: 14,
                                            backgroundColor: 'rgba(28, 28, 32, 0.85)',
                                            px: 0.5,
                                            color: '#bbb',
                                            fontSize: '0.75rem',
                                            fontWeight: 400,
                                            zIndex: 1,
                                        }}
                                    >
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
                                            py: 1.85,
                                            borderRadius: 2,
                                            height: '56px', // Match TextField height
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                borderColor: 'rgba(108,99,255,0.5)',
                                            },
                                            '&:focus': {
                                                borderColor: '#6C63FF',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {statusOptions.find(opt => opt.value === status)?.label || status}
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Footer */}
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
                            onClick={handleClose}
                            variant="outlined"
                            disabled={loading}
                            fullWidth={{ xs: true, sm: false }}
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                px: 3,
                                order: { xs: 2, sm: 1 },
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#fff',
                                    backgroundColor: 'rgba(255,255,255,0.05)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!title.trim() || loading}
                            startIcon={!loading && <PlusIcon size={16} />}
                            fullWidth={{ xs: true, sm: false }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: { xs: 3, md: 4 },
                                color: '#fff',
                                background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                                order: { xs: 1, sm: 2 },
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 16px rgba(108,99,255,0.4)',
                                },
                                '&:disabled': {
                                    background: 'rgba(108,99,255,0.3)',
                                    color: 'rgba(255,255,255,0.5)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? <CircularProgress color="inherit" size={20} /> : 'Create Project'}
                        </Button>
                    </Box>

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
    );
}
