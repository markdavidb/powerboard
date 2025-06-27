// src/components/TaskDetailsModal.jsx
import React, { useState, useEffect, useMemo, Suspense, memo } from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    Divider,
    TextField,
    Button,
    CircularProgress,
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

    const [anchorEl,         setAnchorEl]        = useState(null);
    const [anchorPriorityEl, setAnchorPriorityEl]= useState(null);

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
    const statusOptions   = useMemo(() => Object.entries(statusConfig)  , []);
    const priorityOptions = useMemo(() => Object.entries(priorityConfig), []);

    const toggleMenu = setter => e => setter(a => (a ? null : e.currentTarget));
    const closeMenus = () => { setAnchorEl(null); setAnchorPriorityEl(null); };

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
                container={container}
                closeAfterTransition
                BackdropProps={{ sx:{ backgroundColor:'rgba(0,0,0,0)' } }}
            >
                <Fade in={open}>
                    <Box sx={{
                        position:'absolute', top:'50%', left:'50%',
                        transform:'translate(-50%,-50%)',
                        width:{ xs:'100%', sm:700, md:700 },
                        bgcolor:'rgba(24,24,30,0.85)', backdropFilter:'blur(24px)',
                        border:'1.5px solid rgba(108,99,255,0.6)',
                        boxShadow:'0 4px 28px rgba(20,20,30,0.13)',
                        borderRadius:2, p:3, maxHeight:'80vh',
                        display:'flex', flexDirection:'column',
                    }}>
                        {/* header */}
                        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                            <Typography variant="h6">{task.title}</Typography>
                            <Box sx={{ display:'flex', gap:1 }}>
                                <IconButton
                                    onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                                    sx={{ color:'rgba(255,255,255,0.7)' }}
                                >
                                    {isEditing ? <ArrowLeft size={20}/> : <Pencil size={20}/> }
                                </IconButton>
                                <IconButton onClick={() => setDeleteOpen(true)} sx={{ color:'#F25757' }}>
                                    <TrashIcon size={20}/>
                                </IconButton>
                                <IconButton onClick={() => { handleCancel(); onClose(); }} sx={{ color:'rgba(255,255,255,0.7)' }}>
                                    <CloseIcon size={20}/>
                                </IconButton>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor:'rgba(255,255,255,0.1)', mb:2 }}/>

                        {/* body */}
                        <Box sx={{ flex:1, overflowY:'auto', pr:1 }}>
                            {/* Epic link – hidden while editing */}
                            {!isEditing && (
                                <Box display="flex" mb={3}>
                                    <Button
                                        size="small"
                                        startIcon={<FolderKanban size={16}/>}
                                        onClick={() => navigate(`/projects/${projectId}/board?epicId=${task.big_task_id}`)}
                                        sx={{
                                            textTransform:'none', color:'rgba(255,255,255,0.8)',
                                            border:'1px solid rgba(255,255,255,0.2)',
                                            borderRadius:2,
                                            '&:hover':{ background:'rgba(255,255,255,0.06)' },
                                        }}
                                    >
                                        Open Epic Board
                                    </Button>
                                </Box>
                            )}

                            {/* status + priority chips (editable chips always shown) */}
                            {[
                                {
                                    label:'Status', value:currentStatus,
                                    options:statusOptions, anchor:anchorEl,
                                    toggle:toggleMenu(setAnchorEl), setLocal:setCurrentStatus,
                                    cfgMap:statusConfig,
                                },
                                {
                                    label:'Priority', value:currentPriority,
                                    options:priorityOptions, anchor:anchorPriorityEl,
                                    toggle:toggleMenu(setAnchorPriorityEl), setLocal:setCurrentPriority,
                                    cfgMap:priorityConfig,
                                },
                            ].map(({label,value,options,anchor,toggle,setLocal,cfgMap}) => (
                                <Box key={label} mb={3}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>{label}</Typography>
                                    <Chip
                                        onClick={isEditing ? toggle : undefined}
                                        label={value}
                                        variant="outlined"
                                        sx={{
                                            px:2, py:1, borderRadius:2,
                                            cursor:isEditing ? 'pointer' : 'default',
                                            border:`1px solid ${cfgMap[value].color}`,
                                            backgroundColor:`${cfgMap[value].color}22`,
                                            color:'#fff', fontWeight:'bold',
                                        }}
                                    />
                                    <Menu
                                        anchorEl={anchor}
                                        open={isEditing && Boolean(anchor)}
                                        onClose={closeMenus}
                                        PaperProps={{ sx:{ bgcolor:'#1e1e2f', borderRadius:2, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' } }}
                                    >
                                        {options.map(([opt,cfg]) => (
                                            <MenuItem
                                                key={opt} selected={opt===value}
                                                onClick={() => { setLocal(opt); closeMenus(); }}
                                                sx={{
                                                    display:'flex', gap:1.5, color:cfg.color, borderRadius:2,
                                                    mx:1, my:0.5,
                                                    '&.Mui-selected':{ bgcolor:`${cfg.color}22` },
                                                    '&:hover':       { bgcolor:`${cfg.color}33` },
                                                }}
                                            >
                                                {cfg.icon}
                                                <Typography variant="body2" fontWeight="bold">{opt}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Box>
                            ))}

                            <Divider sx={{ borderColor:'rgba(255,255,255,0.1)', mb:3 }}/>

                            {/* description + dates */}
                            {isEditing ? (
                                <>
                                    <TextField
                                        label="Description"
                                        multiline rows={4} fullWidth
                                        value={editedDescription}
                                        onChange={e => setEditedDesc(e.target.value)}
                                        sx={{
                                            mb:2, bgcolor:'rgba(255,255,255,0.05)', borderRadius:2,
                                            '& .MuiInputBase-input':{ color:'#fff' },
                                        }}
                                        InputLabelProps={{ sx:{ color:'#bbb' } }}
                                    />
                                    <TextField
                                        label="Due Date"
                                        type="datetime-local"
                                        fullWidth
                                        value={editedDueDate}
                                        onChange={e => setEditedDueDate(e.target.value)}
                                        sx={{
                                            bgcolor:'rgba(255,255,255,0.05)', borderRadius:2,
                                            '& .MuiInputBase-input':{ color:'#fff' },
                                        }}
                                        InputLabelProps={{ shrink:true, sx:{ color:'#bbb' } }}
                                    />
                                </>
                            ) : (
                                <Box>
                                    <Typography mb={2}><strong>Status:</strong> {currentStatus}</Typography>
                                    <Typography mb={2}><strong>Created:</strong> {formattedCreated}</Typography>
                                    <Typography mb={2}><strong>Due:</strong> {formattedDue}</Typography>
                                    <Typography mb={2}><strong>Description:</strong> {task.description || 'N/A'}</Typography>
                                </Box>
                            )}

                            {/* comments – hidden while editing */}
                            {!isEditing && (
                                <Box mt={4}>
                                    <Suspense fallback={<Typography color="gray">Loading comments…</Typography>}>
                                        <CommentsSection taskId={task.id}/>
                                    </Suspense>
                                </Box>
                            )}
                        </Box>

                        {/* bottom action bar (only in edit mode) */}
                        {isEditing && (
                            <>
                                <Divider sx={{ borderColor:'rgba(255,255,255,0.1)', my:2 }}/>
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <Button
                                        onClick={handleCancel}
                                        variant="outlined"
                                        sx={{ color:'rgba(255,255,255,0.8)', borderColor:'rgba(255,255,255,0.2)' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        variant="contained"
                                        startIcon={!loading && <SaveIcon size={16}/>}
                                        disabled={loading}
                                        sx={{
                                            background:'linear-gradient(135deg,#6C63FF,#8A78FF)',
                                            textTransform:'none',
                                            boxShadow:'0 6px 18px rgba(108,99,255,0.4)',
                                            '&:hover':{ background:'linear-gradient(135deg,#5b54e6,#7b68ff)' },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit"/> : 'Save'}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* delete confirm modal */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDeleteTask}
                loading={deleting}
                title="Delete this task?"
                subtitle="This action can’t be undone. Are you sure?"
                container={container}
            />
        </>
    );
}

export default memo(TaskDetailsModal);
