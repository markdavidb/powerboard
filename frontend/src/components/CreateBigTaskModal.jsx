// src/components/CreateBigTaskModal.jsx

import React, {useState, useRef} from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Stack,
    Tooltip,
} from '@mui/material';
import {X as CloseIcon, Plus as PlusIcon, ClipboardList, RefreshCcw, CheckCircle, ChevronsUp, ChevronUp, Minus, ChevronDown, ChevronsDown} from 'lucide-react';
import {useSnackbar} from 'notistack';
import {API} from '../api/axios';
import ModernSelectMenu from './ModernSelectMenu';

const statusOptions = [
    { value: 'To Do', label: 'To Do', icon: ClipboardList },
    { value: 'In Progress', label: 'In Progress', icon: RefreshCcw },
    { value: 'Done', label: 'Done', icon: CheckCircle }
];

const priorityOptions = [
    { value: 'Highest', label: 'Highest', icon: ChevronsUp },
    { value: 'High', label: 'High', icon: ChevronUp },
    { value: 'Medium', label: 'Medium', icon: Minus },
    { value: 'Low', label: 'Low', icon: ChevronDown },
    { value: 'Lowest', label: 'Lowest', icon: ChevronsDown }
];

const statusColors = {
    'To Do': '#6c6c6c',
    'In Progress': '#2196f3',
    'Done': '#4caf50'
};

const priorityColors = {
    'Highest': '#e53935',
    'High': '#ffb300',
    'Medium': '#1e88e5',
    'Low': '#43a047',
    'Lowest': '#757575'
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

export default function CreateBigTaskModal({open, onClose, projectId, onCreated}) {
    const {enqueueSnackbar} = useSnackbar();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('To Do');
    const [priority, setPriority] = useState('Medium');
    const [titleError, setTitleError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);

    // Menu states
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('To Do');
        setPriority('Medium');
        setTitleError('');
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
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
            .post('/projects/big_tasks/big_tasks/', {
                title: title.trim(),
                description,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                status,
                priority,
                project_id: projectId,
            })
            .then(res => {
                onCreated(res.data);
                enqueueSnackbar('Epic created successfully!', {variant: 'success'});
                resetForm();
                onClose();
            })
            .catch(err => {
                console.error(err);
                enqueueSnackbar('Failed to create epic', {variant: 'error'});
            })
            .finally(() => {
                submittingRef.current = false;
                setSubmitting(false);
            });
    };

    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{sx: {backgroundColor: 'rgba(0,0,0,0)'}}}
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
                            Create New Epic
                        </Typography>
                        <Tooltip title="Close">
                            <IconButton
                                onClick={handleClose}
                                disabled={submitting}
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
                                label="Title"
                                value={title}
                                error={!!titleError}
                                helperText={titleError}
                                onChange={e => {
                                    setTitle(e.target.value);
                                    if (e.target.value.trim()) setTitleError('');
                                }}
                                sx={inputSx}
                                disabled={submitting}
                                InputLabelProps={{ sx: { color: '#bbb' } }}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                minRows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                sx={inputSx}
                                disabled={submitting}
                                InputLabelProps={{ sx: { color: '#bbb' } }}
                            />

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
                                disabled={submitting}
                            />

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 2
                            }}>
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
                                        disabled={submitting}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textTransform: 'none',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderColor: 'rgba(108,99,255,0.3)',
                                            color: '#fff',
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                borderColor: 'rgba(108,99,255,0.5)',
                                            }
                                        }}
                                    >
                                        {statusOptions.find(opt => opt.value === status)?.label || status}
                                    </Button>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{
                                        color: '#bbb',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        mb: 0.5,
                                        ml: 1
                                    }}>
                                        Priority
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={(e) => setPriorityAnchorEl(e.currentTarget)}
                                        disabled={submitting}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textTransform: 'none',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderColor: 'rgba(108,99,255,0.3)',
                                            color: '#fff',
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                borderColor: 'rgba(108,99,255,0.5)',
                                            }
                                        }}
                                    >
                                        {priorityOptions.find(opt => opt.value === priority)?.label || priority}
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
                            disabled={submitting}
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
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!title.trim() || submitting}
                            startIcon={!submitting && <PlusIcon size={16} />}
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
                            {submitting ? <CircularProgress color="inherit" size={20} /> : 'Create Epic'}
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

                    {/* Priority Select Menu */}
                    <ModernSelectMenu
                        open={Boolean(priorityAnchorEl)}
                        anchorEl={priorityAnchorEl}
                        onClose={() => setPriorityAnchorEl(null)}
                        value={priority}
                        onChange={setPriority}
                        options={priorityOptions}
                        title="Select Priority"
                    />
                </Box>
            </Fade>
        </Modal>
    );
}
