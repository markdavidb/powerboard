// src/components/TaskDetailsModal.jsx
import React, { useState, useEffect, useMemo, Suspense, memo } from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    X as CloseIcon,
    ArrowLeft,
    Pencil,
    CheckCircle,
    ClipboardList,
    Search,
    RefreshCcw,
    ChevronsUp,
    ChevronUp,
    Minus,
    ChevronDown,
    ChevronsDown,
    FolderKanban,
    Save as SaveIcon,
    Trash2 as TrashIcon,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../api/axios';
import DeleteConfirmModal from './DeleteConfirmModal';
import ModernSelectMenu from './ModernSelectMenu';

const statusConfig = Object.freeze({
    'To Do':       { icon: <ClipboardList size={18} />, color: '#6c6c6c' },
    'In Progress': { icon: <RefreshCcw   size={18} />, color: '#2196f3' },
    Review:        { icon: <Search       size={18} />, color: '#ff9800' },
    Done:          { icon: <CheckCircle  size={18} />, color: '#4caf50' },
});
const priorityConfig = Object.freeze({
    Highest: { icon: <ChevronsUp   size={18} />, color: '#e53935' },
    High:    { icon: <ChevronUp    size={18} />, color: '#ffb300' },
    Medium:  { icon: <Minus        size={18} />, color: '#1e88e5' },
    Low:     { icon: <ChevronDown  size={18} />, color: '#43a047' },
    Lowest:  { icon: <ChevronsDown size={18} />, color: '#757575' },
});

const statusOptions = [
    { value: 'To Do', label: 'To Do', icon: ClipboardList },
    { value: 'In Progress', label: 'In Progress', icon: RefreshCcw },
    { value: 'Review', label: 'Review', icon: Search },
    { value: 'Done', label: 'Done', icon: CheckCircle }
];

const priorityOptions = [
    { value: 'Highest', label: 'Highest', icon: ChevronsUp },
    { value: 'High', label: 'High', icon: ChevronUp },
    { value: 'Medium', label: 'Medium', icon: Minus },
    { value: 'Low', label: 'Low', icon: ChevronDown },
    { value: 'Lowest', label: 'Lowest', icon: ChevronsDown }
];

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
};

const CommentsSection = React.lazy(() => import('./CommentsSection'));

function TaskDetailsModal({
                              open,
                              onClose,
                              task,
                              onTaskUpdated,
                              projectId: propProjectId,
                              container,
                          }) {
    const { projectId: routeProjectId } = useParams();
    const projectId = propProjectId ?? routeProjectId;
    const navigate  = useNavigate();

    /* ─── state ─────────────────────────────────────────────── */
    const [currentStatus,     setCurrentStatus]  = useState('To Do');
    const [currentPriority,   setCurrentPriority]= useState('Medium');
    const [editedDescription, setEditedDesc]     = useState('');
    const [editedDueDate,     setEditedDueDate]  = useState('');
    const [isEditing,         setIsEditing]      = useState(false);
    const [loading,           setLoading]        = useState(false);

    const [deleteModalOpen, setDeleteOpen] = useState(false);
    const [deleting,        setDeleting]   = useState(false);

    // Menu states for ModernSelectMenu
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);

    /* ─── lifecycle ─────────────────────────────────────────── */
    useEffect(() => {
        if (!task) return;
        setCurrentStatus(task.status);
        setCurrentPriority(task.priority);
        setEditedDesc(task.description || '');
        setEditedDueDate(task.due_date?.slice(0,16) || '');
    }, [task]);

    useEffect(() => { if (!open) setIsEditing(false); }, [open]);

    /* ─── helpers ───────────────────────────────────────────── */
    const toggleMenu = setter => e => setter(a => (a ? null : e.currentTarget));
    const closeMenus = () => { setStatusAnchorEl(null); setPriorityAnchorEl(null); };

    const handleCancel = () => {
        if (task) {
            setCurrentStatus(task.status);
            setCurrentPriority(task.priority);
            setEditedDesc(task.description || '');
            setEditedDueDate(task.due_date?.slice(0,16) || '');
        }
        setIsEditing(false);
        closeMenus();
    };

    const handleSave = async () => {
        if (!task || loading) return;
        setLoading(true);
        try {
            const { data } = await API.project.put(
                `/projects/tasks/${task.id}`,
                {
                    title: task.title,
                    description: editedDescription,
                    status: currentStatus,
                    issue_type: task.issue_type,
                    priority: currentPriority,
                    reporter_id: Number(task.reporter_id),
                    due_date: editedDueDate || null,
                    project_id: Number(projectId),
                    big_task_id: task.big_task_id || null,
                    assignee_id: task.assignee_id || null,
                },
            );
            onTaskUpdated?.(data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            closeMenus();
        }
    };

    const handleDeleteTask = async () => {
        if (!task) return;
        setDeleting(true);
        try {
            await API.project.delete(`/projects/tasks/${task.id}`);
            setDeleteOpen(false);
            onClose();
            onTaskUpdated?.({ deletedId: task.id });
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    /* ─── render guards ─────────────────────────────────────── */
    if (!open || !task) return null;

    /* ─── presentation ─────────────────────────────────────── */
    const formattedCreated = task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A';
    const formattedDue     = task.due_date    ? new Date(task.due_date   ).toLocaleString() : 'N/A';

    return (
        <>
            <Modal
                open={open}
                onClose={() => { handleCancel(); onClose(); }}
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
                            width: { xs: '95%', sm: '90%', md: 700 },
                            maxWidth: { xs: '100vw', sm: '600px', md: '700px' },
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
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                color: '#fff',
                                flex: 1,
                                mr: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {!isEditing && (
                                    <Tooltip title="Edit Task">
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
                                            <Pencil size={18} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete Task">
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
                                        onClick={() => { handleCancel(); onClose(); }}
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
                            {/* Epic link – hidden while editing */}
                            {!isEditing && task.big_task_id && (
                                <Box sx={{ mb: 3 }}>
                                    <Button
                                        size="small"
                                        startIcon={<FolderKanban size={16} />}
                                        onClick={() => navigate(`/projects/${projectId}/board?epicId=${task.big_task_id}`)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            fontSize: { xs: '0.75rem', md: '0.85rem' },
                                            background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                            boxShadow: '0 2px 8px rgba(108,99,255,0.3)',
                                            px: { xs: 1.5, md: 2 },
                                            py: { xs: 0.5, md: 0.75 },
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        Open Epic Board
                                    </Button>
                                </Box>
                            )}

                            {/* Status & Priority Chips */}
                            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {/* Status Chip */}
                                <Box>
                                    <Typography variant="body2" sx={{
                                        color: '#888',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.5px',
                                        mb: 1
                                    }}>
                                        Status
                                    </Typography>
                                    {isEditing ? (
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
                                            startIcon={statusConfig[currentStatus]?.icon}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textTransform: 'none',
                                                backgroundColor: `${statusConfig[currentStatus]?.color}22`,
                                                border: `1px solid ${statusConfig[currentStatus]?.color}`,
                                                color: statusConfig[currentStatus]?.color,
                                                fontWeight: 500,
                                                minWidth: 120,
                                                '&:hover': {
                                                    backgroundColor: `${statusConfig[currentStatus]?.color}33`,
                                                },
                                            }}
                                        >
                                            {currentStatus}
                                        </Button>
                                    ) : (
                                        <Chip
                                            icon={statusConfig[currentStatus]?.icon}
                                            label={currentStatus}
                                            sx={{
                                                backgroundColor: `${statusConfig[currentStatus]?.color}22`,
                                                border: `1px solid ${statusConfig[currentStatus]?.color}`,
                                                color: statusConfig[currentStatus]?.color,
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Priority Chip */}
                                <Box>
                                    <Typography variant="body2" sx={{
                                        color: '#888',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.5px',
                                        mb: 1
                                    }}>
                                        Priority
                                    </Typography>
                                    {isEditing ? (
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => setPriorityAnchorEl(e.currentTarget)}
                                            startIcon={priorityConfig[currentPriority]?.icon}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textTransform: 'none',
                                                backgroundColor: `${priorityConfig[currentPriority]?.color}22`,
                                                border: `1px solid ${priorityConfig[currentPriority]?.color}`,
                                                color: priorityConfig[currentPriority]?.color,
                                                fontWeight: 500,
                                                minWidth: 120,
                                                '&:hover': {
                                                    backgroundColor: `${priorityConfig[currentPriority]?.color}33`,
                                                },
                                            }}
                                        >
                                            {currentPriority}
                                        </Button>
                                    ) : (
                                        <Chip
                                            icon={priorityConfig[currentPriority]?.icon}
                                            label={currentPriority}
                                            sx={{
                                                backgroundColor: `${priorityConfig[currentPriority]?.color}22`,
                                                border: `1px solid ${priorityConfig[currentPriority]?.color}`,
                                                color: priorityConfig[currentPriority]?.color,
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />

                            {/* Task Details */}
                            {isEditing ? (
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        label="Description"
                                        multiline
                                        minRows={4}
                                        fullWidth
                                        value={editedDescription}
                                        onChange={e => setEditedDesc(e.target.value)}
                                        sx={{ ...inputSx, mb: 2 }}
                                        InputLabelProps={{ sx: { color: '#bbb' } }}
                                    />
                                    <TextField
                                        label="Due Date"
                                        type="datetime-local"
                                        fullWidth
                                        value={editedDueDate}
                                        onChange={e => setEditedDueDate(e.target.value)}
                                        sx={inputSx}
                                        InputLabelProps={{ shrink: true, sx: { color: '#bbb' } }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 2,
                                    p: { xs: 2, md: 3 },
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    mb: 3
                                }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: { xs: 1, sm: 2 }, alignItems: 'start', mb: 2 }}>
                                        <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            Created
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#e0e0e0', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                            {formattedCreated}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 1.5 }} />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: { xs: 1, sm: 2 }, alignItems: 'start', mb: 2 }}>
                                        <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            Due Date
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#e0e0e0', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                            {formattedDue}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 1.5 }} />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: { xs: 1, sm: 2 }, alignItems: 'start' }}>
                                        <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            Description
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                            {task.description || 'No description provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Comments – hidden while editing */}
                            {!isEditing && (
                                <Suspense fallback={
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} sx={{ color: '#6C63FF' }} />
                                    </Box>
                                }>
                                    <CommentsSection taskId={task.id} />
                                </Suspense>
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
                                    onClick={handleCancel}
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
                            value={currentStatus}
                            onChange={setCurrentStatus}
                            options={statusOptions}
                            title="Select Status"
                        />

                        {/* Priority Select Menu */}
                        <ModernSelectMenu
                            open={Boolean(priorityAnchorEl)}
                            anchorEl={priorityAnchorEl}
                            onClose={() => setPriorityAnchorEl(null)}
                            value={currentPriority}
                            onChange={setCurrentPriority}
                            options={priorityOptions}
                            title="Select Priority"
                        />
                    </Box>
                </Fade>
            </Modal>

            {/* Delete confirm modal */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDeleteTask}
                loading={deleting}
                title="Delete this task?"
                subtitle="This action can't be undone. Are you sure?"
            />
        </>
    );
}

export default memo(TaskDetailsModal);
