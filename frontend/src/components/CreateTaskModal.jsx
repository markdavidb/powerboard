// src/components/CreateTaskModal.jsx

import React, {useState, useEffect, useRef} from 'react';
import {
    Modal,
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Divider,
    CircularProgress,
} from '@mui/material';
import {useSnackbar} from 'notistack';
import {API} from '../api/axios';

const modalSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const paperSx = {
    width: {xs: '95vw', sm: 500},
    maxHeight: {xs: '55vh', sm: '75vh'},
    bgcolor: '#18181E',
    border: '1px solid #6C63FF',
    borderRadius: 2,
    p: 3,
    boxShadow: '0 4px 28px rgba(0,0,0,0.3)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',

    // ← add the scroll here:
    overflowY: 'auto',
    // ← move your custom scrollbar styles up here:
    '&::-webkit-scrollbar': {width: '4px'},
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(108,99,255,0.4)',
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
    },
};


const scrollAreaSx = {
    flex: 1,
    mb: 2,
};


const inputSx = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(108,99,255,0.3)'},
    '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(108,99,255,0.5)'},
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#6C63FF'},
    '& .MuiInputBase-input': {color: '#fff'},
};

const labelSx = {color: '#bbb', mb: 1};

export default function CreateTaskModal({
                                            open,
                                            onClose,
                                            onTaskCreated,
                                            projectId,
                                            bigTaskId = null,
                                        }) {
    const {enqueueSnackbar} = useSnackbar();
    const [title, setTitle] = useState('');
    const [description, setDesc] = useState('');
    const [status, setStatus] = useState('To Do');
    const [priority, setPriority] = useState('Medium');
    const [issueType, setIssueType] = useState('Task');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [projectMembers, setProjectMembers] = useState([]);
    const [myId, setMyId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);

    useEffect(() => {
        API.user.get('/users/me')
            .then(res => setMyId(res.data.id))
            .catch(() => enqueueSnackbar('Failed to fetch your user ID', {variant: 'error'}));
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (open && projectId) {
            API.project.get(`/projects/members/${projectId}/members`)
                .then(res => {
                    setProjectMembers(res.data);
                })
                .catch(err => {
                    console.error("Failed to fetch project members", err);
                    enqueueSnackbar('Could not load project members', {variant: 'error'});
                });
        }
    }, [open, projectId, enqueueSnackbar]);

    const reset = () => {
        setTitle('');
        setDesc('');
        setStatus('To Do');
        setPriority('Medium');
        setIssueType('Task');
        setDueDate('');
        setAssigneeId('');
        setProjectMembers([]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (submittingRef.current) return;
        if (myId == null) {
            enqueueSnackbar('Still loading your user ID…', {variant: 'warning'});
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);

        const payload = {
            title,
            description,
            status,
            issue_type: issueType,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            project_id: Number(projectId),
            big_task_id: bigTaskId ? Number(bigTaskId) : null,
            assignee_id: assigneeId || myId,
        };

        try {
            const {data} = await API.project.post('/projects/tasks/', payload);
            onTaskCreated?.(data);
            enqueueSnackbar('Task created successfully!', {variant: 'success'});
            reset();
            onClose();
        } catch {
            enqueueSnackbar('Failed to create task', {variant: 'error'});
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                if (!submitting) {
                    reset();
                    onClose();
                }
            }}
            BackdropProps={{sx: {backgroundColor: 'transparent'}}}
            sx={modalSx}
        >
            <Box component="form" onSubmit={handleSubmit} sx={paperSx}>
                {/* Header */}
                <Typography variant="h6" fontWeight="bold" sx={{color: '#e0e0e0', mb: 2}}>
                    Create New Task
                </Typography>

                {/* Scrollable content */}
                <Box sx={scrollAreaSx}>
                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Title
                        </Typography>
                        <TextField
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            fullWidth
                            required
                            sx={inputSx}
                            disabled={submitting}
                        />
                    </Box>

                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Description
                        </Typography>
                        <TextField
                            value={description}
                            onChange={e => setDesc(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={inputSx}
                            disabled={submitting}
                        />
                    </Box>

                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Status
                        </Typography>
                        <FormControl fullWidth sx={inputSx} disabled={submitting}>
                            <Select value={status} onChange={e => setStatus(e.target.value)}>
                                {['To Do', 'In Progress', 'Review', 'Done'].map(s => (
                                    <MenuItem key={s} value={s}>
                                        {s}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Priority
                        </Typography>
                        <FormControl fullWidth sx={inputSx} disabled={submitting}>
                            <Select value={priority} onChange={e => setPriority(e.target.value)}>
                                {['Highest', 'High', 'Medium', 'Low', 'Lowest'].map(p => (
                                    <MenuItem key={p} value={p}>
                                        {p}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Issue Type
                        </Typography>
                        <FormControl fullWidth sx={inputSx} disabled={submitting}>
                            <Select value={issueType} onChange={e => setIssueType(e.target.value)}>
                                {['Task', 'Bug', 'New Feature', 'Improvement'].map(i => (
                                    <MenuItem key={i} value={i}>
                                        {i}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Assignee
                        </Typography>
                        <FormControl fullWidth sx={inputSx} disabled={submitting}>
                            <Select
                                value={assigneeId}
                                onChange={e => setAssigneeId(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Unassigned (Defaults to you)</em>
                                </MenuItem>
                                {projectMembers.map(member => (
                                    <MenuItem key={member.user_id} value={member.user_id}>
                                        {member.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={labelSx}>
                            Due Date
                        </Typography>
                        <TextField
                            type="datetime-local"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            fullWidth
                            sx={{
                                ...inputSx,
                                '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
                                    filter: 'invert(1)',
                                },
                            }}
                            disabled={submitting}
                        />
                    </Box>
                </Box>

                <Divider sx={{borderColor: '#6C63FF', mb: 2}}/>

                {/* Footer */}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                    <Button
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                        disabled={submitting}
                        sx={{color: '#bbb', textTransform: 'none', '&:hover': {color: '#fff'}}}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || !title.trim() || myId == null}
                        sx={{
                            backgroundColor: '#6C63FF',
                            color: '#fff',
                            textTransform: 'none',
                            boxShadow: '0 6px 18px rgba(108,99,255,0.2)',
                            '&:hover': {backgroundColor: '#554FE6', boxShadow: '0 8px 24px rgba(108,99,255,0.3)'},
                        }}
                        startIcon={submitting && <CircularProgress size={18}/>}
                    >
                        {submitting ? 'Creating…' : 'Create Task'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
