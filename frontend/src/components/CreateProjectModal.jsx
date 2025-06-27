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
    MenuItem,
    Stack,
    CircularProgress,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { API } from '../api/axios';

const statusOptions = ['In Progress', 'Done'];

export default function CreateProjectModal({
                                               open,
                                               onClose,
                                               onProjectCreated,
                                               container,
                                           }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStatus('In Progress');
        setDueDate('');
        setError(null);
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleCreate = async e => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await API.project.post('/projects/', {
                title: title.trim(),
                description,
                status,
                due_date: dueDate || null,
            });
            onProjectCreated(res.data);
            handleClose();
        } catch (err) {
            console.error(err);
            setError('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // purple‐accented input style
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
                        width: { xs: '90%', sm: 500 },
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
                            Create New Project
                        </Typography>
                        <IconButton
                            onClick={handleClose}
                            disabled={loading}
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            <CloseIcon size={20} />
                        </IconButton>
                    </Box>

                    {/* Divider */}
                    <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', mb: 2 }} />

                    {/* Form Fields */}
                    <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
                        <TextField
                            fullWidth
                            required
                            label="Project Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={inputSx}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Project Description"
                            multiline
                            minRows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={inputSx}
                            disabled={loading}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={inputSx}
                            disabled={loading}
                        >
                            {statusOptions.map(opt => (
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
                            onChange={e => setDueDate(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ shrink: true, sx: { color: '#bbb' } }}
                            sx={inputSx}
                            disabled={loading}
                        />
                    </Stack>

                    {/* Error Message */}
                    {error && (
                        <Typography
                            color="error"
                            variant="body2"
                            fontWeight={500}
                            sx={{ mt: 2 }}
                        >
                            {error}
                        </Typography>
                    )}

                    {/* Divider */}
                    <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', my: 2 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                borderColor: 'rgba(108,99,255,0.4)',
                                '&:hover': { borderColor: 'rgba(108,99,255,0.6)' },
                                textTransform: 'none',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!title.trim() || loading}
                            startIcon={
                                loading && <CircularProgress size={18} color="inherit" />
                            }
                            sx={{
                                background: 'linear-gradient(135deg,#6C63FF,#8A78FF)',
                                color: '#fff',
                                textTransform: 'none',
                                boxShadow: '0 6px 18px rgba(108,99,255,0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg,#5b54e6,#7b68ff)',
                                },
                            }}
                        >
                            {loading ? 'Creating…' : 'Create'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
