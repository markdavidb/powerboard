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
    MenuItem,
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
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';
import DeleteConfirmModal from './DeleteConfirmModal';

const statusOptions = ['To Do', 'In Progress', 'Done'];
const priorityOptions = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export default function BigTaskDetailsModal({
    open,
    onClose,
    bigTask,
    onUpdated,
    onDeleted,
    container,
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
        setAiLoading(true);
        setAiSuggestions([]);
        try {
            const { data } = await API.ai.post('/ai/suggest_subtasks/', {
                description,
                n: 5,
            });
            setAiSuggestions(data.suggestions || []);
        } catch {
            enqueueSnackbar('AI Assist failed', { variant: 'error' });
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
            enqueueSnackbar('Task added to board', { variant: 'success' });
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
                container={container}
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
                            width: { xs: '90%', sm: 500, md: 600 },
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" color="text.primary">Epic Details</Typography>
                            <Box>
                                {!isEditing && (
                                    <Tooltip title="Edit Epic">
                                        <IconButton onClick={() => setIsEditing(true)} sx={{ color: '#aaa' }}>
                                            <EditIcon size={20} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete Epic">
                                    <IconButton onClick={() => setDeleteOpen(true)} sx={{ color: '#F25757' }}>
                                        <TrashIcon size={20} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Close">
                                    <IconButton onClick={closeForm} sx={{ color: '#aaa' }}>
                                        <CloseIcon size={20} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                        {/* Body */}
                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {!isEditing && (
                                <>
                                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                        <Button
                                            size="small"
                                            startIcon={aiLoading
                                                ? <CircularProgress size={14} />
                                                : <Sparkles size={16} />}
                                            variant="outlined"
                                            onClick={fetchAISuggestions}
                                            sx={{
                                                color: '#ddd',
                                                borderColor: 'rgba(255,255,255,0.2)',
                                            }}
                                        >
                                            AI Assist
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={() => setAiSuggestions([])}
                                            disabled={aiLoading || aiSuggestions.length === 0}
                                            sx={{ color: '#aaa', ml: 1 }}
                                        >
                                            <CloseIcon size={16} />
                                        </IconButton>
                                    </Box>
                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        {aiSuggestions.map((s, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    px: 2, py: 1,
                                                    borderRadius: 2,
                                                    background: 'rgba(108,99,255,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    '&:hover': { background: 'rgba(108,99,255,0.15)' },
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>
                                                    • {s}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleAddSuggestion(i, s)}
                                                    disabled={added[i] || addingIdx === i}
                                                    sx={{ color: added[i] ? '#4caf50' : '#9b8eff' }}
                                                >
                                                    {added[i] ? <Check size={16} /> : <Plus size={16} />}
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                </>
                            )}

                            {isEditing ? (
                                <Stack spacing={2}>
                                    {/* Title */}
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
                                        InputProps={{ sx: { color: '#fff' } }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />

                                    {/* Other fields */}
                                    <TextField
                                        fullWidth multiline minRows={3}
                                        label="Description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        InputProps={{ sx: { color: '#fff' } }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />
                                    <TextField
                                        fullWidth type="date"
                                        label="Due Date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        InputProps={{ sx: { color: '#fff' } }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />
                                    <TextField
                                        select fullWidth
                                        label="Status"
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        InputProps={{ sx: { color: '#fff' } }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    >
                                        {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                    <TextField
                                        select fullWidth
                                        label="Priority"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        InputProps={{ sx: { color: '#fff' } }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    >
                                        {priorityOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                </Stack>
                            ) : (
                                <Stack spacing={1}>
                                    <Typography variant="body2"><strong>Title:</strong> {title}</Typography>
                                    <Typography variant="body2"><strong>Description:</strong> {description || '—'}</Typography>
                                    <Typography variant="body2"><strong>Due Date:</strong> {dueDate || 'None'}</Typography>
                                    <Typography variant="body2"><strong>Status:</strong> {status}</Typography>
                                    <Typography variant="body2"><strong>Priority:</strong> {priority}</Typography>
                                </Stack>
                            )}
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                        {/* Footer actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                onClick={closeForm}
                                variant="outlined"
                                sx={{ color: '#ddd', borderColor: 'rgba(255,255,255,0.3)' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                variant="contained"
                                startIcon={!saving && <SaveIcon size={16} />}
                                disabled={saving || !isEditing}
                            >
                                {saving ? <CircularProgress color="inherit" size={20} /> : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* DELETE CONFIRM */}
            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDelete}        // ← use onDelete, not onConfirm
                loading={deleting}             // ← use loading prop for spinner
                title="Delete Epic?"
                subtitle="You must delete or move all its tasks first."
            />
        </>
    );
}
