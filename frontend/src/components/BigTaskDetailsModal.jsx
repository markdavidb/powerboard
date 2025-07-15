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
    Tooltip,
    CircularProgress,
    Stack,
} from '@mui/material';
import {
    X as CloseIcon,
    Pencil as EditIcon,
    Save as SaveIcon,
    Sparkles,
    Plus,
    Check,
    Trash2 as TrashIcon,
    ClipboardList,
    RefreshCcw,
    CheckCircle,
    ChevronsUp,
    ChevronUp,
    Minus,
    ChevronDown,
    ChevronsDown,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';
import DeleteConfirmModal from './DeleteConfirmModal';
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

// Status and Priority color mappings
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

export default function BigTaskDetailsModal({
    open,
    onClose,
    bigTask,
    onUpdated,
    onDeleted,
}) {
    const { enqueueSnackbar } = useSnackbar();

    // form + UI state
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');

    // AI Assist state
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [addingIdx, setAddingIdx] = useState(null);
    const [added, setAdded] = useState({});

    // save/delete loading
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Menu states
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);

    // initialize when bigTask changes
    useEffect(() => {
        if (!bigTask) return;
        setTitle(bigTask.title || '');
        setTitleError('');
        setDescription(bigTask.description || '');
        setDueDate(bigTask.due_date ? bigTask.due_date.slice(0, 10) : '');
        setStatus(bigTask.status || '');
        setPriority(bigTask.priority || '');
        setIsEditing(false);
        setAiSuggestions([]);
        setAdded({});
        setAddingIdx(null);
    }, [bigTask]);

    // AI assist
    const fetchAISuggestions = async () => {
        if (!description.trim()) {
            enqueueSnackbar('Add a description to get suggestions', { variant: 'info' });
            return;
        }

        if (description.trim().length < 5) {
            enqueueSnackbar('Description must be at least 5 characters long for AI suggestions', { variant: 'warning' });
            return;
        }

        setAiLoading(true);
        setAiSuggestions([]);
        try {
            const { data } = await API.ai.post('/ai/suggest_subtasks', {
                description,
                n: 5,
            });
            setAiSuggestions(data.suggestions || []);
        } catch (error) {
            // Handle specific validation errors
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.detail;
                if (validationErrors && Array.isArray(validationErrors)) {
                    const descriptionError = validationErrors.find(err =>
                        err.loc?.includes('description') && err.type === 'string_too_short'
                    );
                    if (descriptionError) {
                        enqueueSnackbar('Description must be at least 5 characters long for AI suggestions', { variant: 'warning' });
                        return;
                    }
                }
                enqueueSnackbar('Please check your input and try again', { variant: 'warning' });
            } else {
                enqueueSnackbar('AI Assist failed. Please try again later.', { variant: 'error' });
            }
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddSuggestion = async (idx, suggestion) => {
        if (addingIdx !== null || added[idx]) return;
        setAddingIdx(idx);
        try {
            await API.project.post('/projects/tasks/', {
                title: suggestion,
                description: '',
                status: 'To Do',
                priority: 'Medium',
                issue_type: 'Task',
                project_id: bigTask.project_id,
                big_task_id: bigTask.id,
            });
            setAdded(prev => ({ ...prev, [idx]: true }));
            enqueueSnackbar('Task added to board.', { variant: 'success' });
        } catch {
            enqueueSnackbar('Failed to create task', { variant: 'error' });
        } finally {
            setAddingIdx(null);
        }
    };

    // saving edits
    const handleSave = async () => {
        if (saving) return;
        if (!title.trim()) {
            setTitleError('Title is required');
            return;
        }
        setSaving(true);
        try {
            const { data } = await API.project.put(
                `/projects/big_tasks/big_tasks/${bigTask.id}`,
                {
                    title: title.trim(),
                    description,
                    due_date: dueDate ? new Date(dueDate).toISOString() : null,
                    status,
                    priority,
                    project_id: bigTask.project_id,
                }
            );
            onUpdated?.(data);
            enqueueSnackbar('Epic updated', { variant: 'success' });
            setIsEditing(false);
        } catch {
            enqueueSnackbar('Failed to update epic', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // deletion
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await API.project.delete(`/projects/big_tasks/big_tasks/${bigTask.id}`);
            enqueueSnackbar('Epic deleted', { variant: 'success' });
            setDeleteOpen(false);
            onDeleted?.(bigTask.id);
            onClose();
        } catch (err) {
            enqueueSnackbar(
                err.response?.data?.detail ||
                'Cannot delete epic until all its tasks are removed.',
                { variant: 'error' }
            );
        } finally {
            setDeleting(false);
        }
    };

    const closeForm = () => {
        setIsEditing(false);
        onClose();
    };

    if (!bigTask) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={closeForm}
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
                            width: { xs: '95%', sm: '90%', md: 600 },
                            maxWidth: { xs: '100vw', sm: '500px', md: '600px' },
                            bgcolor: 'rgba(28, 28, 32, 0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108,99,255,0.1)',
                            borderRadius: 3,
                            outline: 'none',
                            p: 0,
                            maxHeight: { xs: '50vh', sm: '60vh', md: '90vh' },
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
                                Epic Details
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {!isEditing && (
                                    <Tooltip title="Edit Epic">
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
                                <Tooltip title="Delete Epic">
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
                                        onClick={closeForm}
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
                            {!isEditing && (
                                <>
                                    {/* AI Assistant Section */}
                                    <Box sx={{ mb: { xs: 2, md: 3 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Button
                                                size="small"
                                                startIcon={aiLoading
                                                    ? <CircularProgress size={14} sx={{ color: 'inherit' }} />
                                                    : <Sparkles size={14} />}
                                                variant="contained"
                                                onClick={fetchAISuggestions}
                                                disabled={aiLoading}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                                                    background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                                    boxShadow: '0 2px 8px rgba(108,99,255,0.3)',
                                                    px: { xs: 1.5, md: 2 },
                                                    py: { xs: 0.5, md: 0.75 },
                                                    minHeight: { xs: '28px', md: '32px' },
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                    AI Suggestions
                                                </Box>
                                                <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                                    AI
                                                </Box>
                                            </Button>
                                            {aiSuggestions.length > 0 && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setAiSuggestions([])}
                                                    disabled={aiLoading}
                                                    sx={{
                                                        color: '#aaa',
                                                        p: 0.5,
                                                        '&:hover': {
                                                            color: '#fff',
                                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                                        }
                                                    }}
                                                >
                                                    <CloseIcon size={14} />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {/* AI Suggestions */}
                                        <Stack spacing={1.5}>
                                            {aiSuggestions.map((s, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        px: { xs: 2, md: 3 },
                                                        py: { xs: 1.5, md: 2 },
                                                        borderRadius: 2,
                                                        background: 'rgba(108,99,255,0.08)',
                                                        border: '1px solid rgba(108,99,255,0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            background: 'rgba(108,99,255,0.12)',
                                                            borderColor: 'rgba(108,99,255,0.3)',
                                                            transform: 'translateY(-1px)'
                                                        },
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{
                                                        flex: 1,
                                                        mr: 2,
                                                        color: '#e0e0e0',
                                                        lineHeight: 1.5,
                                                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                                                    }}>
                                                        • {s}
                                                    </Typography>
                                                    <Tooltip title={added[i] ? "Added to board" : "Add as new task"}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleAddSuggestion(i, s)}
                                                            disabled={added[i] || addingIdx === i}
                                                            sx={{
                                                                color: added[i] ? '#4caf50' : '#9b8eff',
                                                                backgroundColor: 'rgba(0,0,0,0.2)',
                                                                p: { xs: 0.5, md: 0.75 },
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {addingIdx === i
                                                                ? <CircularProgress size={14} color="inherit" />
                                                                : (added[i] ? <Check size={14} /> : <Plus size={14} />)
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </>
                            )}

                            {isEditing ? (
                                <Stack spacing={{ xs: 2, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={title}
                                        onChange={e => {
                                            setTitle(e.target.value);
                                            setTitleError('');
                                        }}
                                        error={!!titleError}
                                        helperText={titleError}
                                        sx={inputSx}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        label="Description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        sx={inputSx}
                                    />
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Due Date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={inputSx}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
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
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#888',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                    letterSpacing: '0.5px',
                                                    mb: 0.5
                                                }}>
                                                    Priority
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: priorityColors[priority] || '#e0e0e0',
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                                                }}>
                                                    {priority}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{
                            p: { xs: 2, md: 3 },
                            pt: { xs: 1.5, md: 2 },
                            background: 'rgba(255,255,255,0.02)',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: isEditing ? 'space-between' : 'flex-end',
                            gap: 2
                        }}>
                            {isEditing && (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(false)}
                                        variant="outlined"
                                        sx={{
                                            color: '#ddd',
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            px: 3,
                                            py: 1,
                                            minWidth: 100,
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
                                        onClick={handleSave}
                                        variant="contained"
                                        startIcon={!saving && <SaveIcon size={16} />}
                                        disabled={saving}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            minWidth: 100,
                                            background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                            boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
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
                                        {saving ? <CircularProgress color="inherit" size={20} /> : 'Save'}
                                    </Button>
                                </>
                            )}

                            {!isEditing && (
                                <Button
                                    onClick={closeForm}
                                    variant="outlined"
                                    sx={{
                                        color: '#ddd',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        px: 3,
                                        py: 1,
                                        minWidth: 100,
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#fff',
                                            backgroundColor: 'rgba(255,255,255,0.05)'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            )}
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

            {/* DELETE CONFIRM */}
            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDelete}
                loading={deleting}
                title="Delete Epic?"
                subtitle="You must delete or move all its tasks first."
            />
        </>
    );
}
