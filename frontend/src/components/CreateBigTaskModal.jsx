// src/components/CreateBigTaskModal.jsx

import React, { useState, useRef } from 'react';
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
    CircularProgress,
    Stack,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';

const statusOptions   = ['To Do', 'In Progress', 'Done'];
const priorityOptions = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export default function CreateBigTaskModal({ open, onClose, projectId, onCreated }) {
    const { enqueueSnackbar } = useSnackbar();
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate]         = useState('');
    const [status, setStatus]           = useState('To Do');
    const [priority, setPriority]       = useState('Medium');
    const [titleError, setTitleError]   = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const submittingRef = useRef(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('To Do');
        setPriority('Medium');
        setTitleError('');
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setTitleError('Title is required');
            return;
        }
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);

        API.project
            .post('/projects/big_tasks/big_tasks', {
                title: title.trim(),
                description,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                status,
                priority,
                project_id: projectId,
            })
            .then(res => {
                onCreated(res.data);
                resetForm();
                onClose();
            })
            .catch(err => {
                console.error(err);
                enqueueSnackbar('Failed to create epic', { variant: 'error' });
            })
            .finally(() => {
                submittingRef.current = false;
                setSubmitting(false);
            });
    };

    // reusable purple‐accented input style
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

    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={submitting ? undefined : onClose}
            closeAfterTransition
            BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '55%',
                        left: '55%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 500 },
                        bgcolor: 'rgba(24,24,30,0.85)',
                        backdropFilter: 'blur(24px)',
                        border: '1.5px solid rgba(108,99,255,0.6)',       // purple border
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="text.primary">
                            Create New Epic
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            disabled={submitting}
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            <CloseIcon size={20} />
                        </IconButton>
                    </Box>

                    {/* Purple‐tinted divider */}
                    <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', mb: 2 }} />

                    {/* Form */}
                    <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
                        <TextField
                            fullWidth
                            required
                            label="Title"
                            value={title}
                            error={!!titleError}
                            helperText={titleError}
                            onChange={e => {
                                setTitle(e.target.value);
                                if (e.target.value.trim()) setTitleError('');
                            }}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={{ ...inputSx }}
                            disabled={submitting}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            minRows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={{ ...inputSx }}
                            disabled={submitting}
                        />

                        <TextField
                            fullWidth
                            type="date"
                            label="Due Date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ shrink: true, sx: { color: '#bbb' } }}
                            sx={{ ...inputSx }}
                            disabled={submitting}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={{ ...inputSx }}
                            disabled={submitting}
                        >
                            {statusOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Priority"
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#bbb' } }}
                            sx={{ ...inputSx }}
                            disabled={submitting}
                        >
                            {priorityOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    {/* Another purple‐tinted divider */}
                    <Divider sx={{ borderColor: 'rgba(108,99,255,0.3)', my: 2 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                borderColor: 'rgba(108,99,255,0.4)',  // purple outline
                                '&:hover': { borderColor: 'rgba(108,99,255,0.6)' },
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!title.trim() || submitting}
                            startIcon={submitting && <CircularProgress size={18} color="inherit" />}
                            sx={{
                                background: 'linear-gradient(135deg,#6C63FF,#8A78FF)', // purple gradient
                                color: '#fff',
                                textTransform: 'none',
                                boxShadow: '0 6px 18px rgba(108,99,255,0.4)',
                                '&:hover': { background: 'linear-gradient(135deg,#5b54e6,#7b68ff)' },
                            }}
                        >
                            {submitting ? 'Creating…' : 'Create'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
