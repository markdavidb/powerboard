// src/pages/TaskBoard.jsx
import React, {useEffect, useState, useMemo, useRef} from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {API} from '../api/axios';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Menu,
    Divider,
    Tooltip,
    IconButton,
    Collapse,
    useMediaQuery,
    useTheme,
    Tabs,
    Tab,
    Fab,
    Drawer,
} from '@mui/material';
import {
    ChevronLeft,
    Users,
    Search as SearchIcon,
    Calendar as CalendarIcon,
    Plus,
    Filter,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
} from 'lucide-react';
import JiraTaskBoard from '../components/board/JiraTaskBoard';
import TaskDetailsModal from '../components/TaskDetailsModal';
import CreateTaskModal from '../components/CreateTaskModal';
import BigTaskMembersModal from '../components/BigTaskMembersModal';
import BigTaskProgress from '../components/BigTaskProgress';
import BigTaskDetailsModal from '../components/BigTaskDetailsModal';
import {
    filterTextFieldSx,
    filterSelectBoxSx,
    filterSelectSx,
    dueButtonSx,
    dueMenuPaperSx,
    dueMenuItemSx,
    dueDividerSx,
    dueInputBoxSx,
    dueTypographySx,
    dueTextFieldSx,
    dueApplyButtonSx,
} from '../themes/filterStyles';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];


const buttonSx = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    borderRadius: '12px',
    padding: '6px 12px',
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
};

export default function TaskBoard() {
    const {projectId} = useParams();
    const {search} = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const epicId = new URLSearchParams(search).get('epicId');
    const [openEpicModal, setOpenEpicModal] = useState(false);

    const boxRef = useRef(null);

    const [project, setProject] = useState(null);
    const [epic, setEpic] = useState(null);

    // Mobile-specific states
    const [selectedStatusTab, setSelectedStatusTab] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dueFilter, setDueFilter] = useState('');
    const [dueAnchor, setDueAnchor] = useState(null);
    const [monthYear, setMonthYear] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [openMembersModal, setOpenMembersModal] = useState(false);
    const [assigneeFilter, setAssigneeFilter] = useState('');

    const isLoading = loading && authorized;

    useEffect(() => {
        (async () => {
            try {
                const {data: p} = await API.project.get(`/projects/${projectId}`);
                setProject(p);
                if (epicId) {
                    const {data: e} = await API.project.get(`/projects/big_tasks/big_tasks/${epicId}`);
                    setEpic(e);
                }
                const params = {project_id: projectId};
                if (epicId) params.big_task_id = epicId;
                const {data: t} = await API.project.get('/projects/tasks/', {params});
                setTasks(t);
            } catch (err) {
                if (err.response?.status === 403) setAuthorized(false);
                else console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [projectId, epicId]);

    useEffect(() => {
        if (!loading && !authorized) navigate('/forbidden');
    }, [loading, authorized, navigate]);

    const handleTaskCreated = newTask => {
        setTasks(prev => [newTask, ...prev]);
    };

    const handleTaskUpdated = (payload) => {
        if (!payload) return;                       // no-op

        // 1) Deletion payload: { deletedId: <number> }
        if (payload.deletedId) {
            setTasks(prev => prev.filter(t => t.id !== payload.deletedId));
            setSelectedTask(null);                    // close modal if open
            return;
        }

        // 2) Normal update payload – full task object
        setTasks(prev => prev.map(t => (t.id === payload.id ? payload : t)));
        setSelectedTask(prev => (prev && prev.id === payload.id ? payload : prev));
    };

    const openDueMenu = e => setDueAnchor(e.currentTarget);
    const closeDueMenu = () => {
        setDueAnchor(null);
        setMonthYear('');
    };
    const applyMonthYear = () => {
        if (monthYear) setDueFilter(monthYear);
        closeDueMenu();
    };
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPriorityFilter('');
        setDueFilter('');
        setMonthYear('');
    };

    const filteredTasks = useMemo(() => {
        const now = new Date();

        return tasks
            // keep all your other filters exactly as-is
            .filter(t => epicId
                ? ((t.big_task_id ?? t.big_task?.id) === Number(epicId))
                : true
            )
            .filter(t =>
                searchTerm
                    ? [t.title.toLowerCase(), (t.description || '').toLowerCase()]
                        .some(f => f.includes(searchTerm.toLowerCase()))
                    : true
            )
            .filter(t => statusFilter ? t.status === statusFilter : true)
            .filter(t => priorityFilter ? t.priority === priorityFilter : true)
            .filter(t =>
                assigneeFilter
                    ? t.creator_name?.toLowerCase().includes(assigneeFilter.toLowerCase())
                    : true
            )
            // —— updated block below ——
            .filter(t => {
                if (!dueFilter) return true;
                const d = t.due_date ? new Date(t.due_date) : null;

                switch (dueFilter) {
                    case 'overdue':
                        return d && d < now;
                    case 'today':
                        return d && d.toDateString() === now.toDateString();
                    case 'week': {
                        if (!d) return false;
                        const weekFromNow = new Date();
                        weekFromNow.setDate(now.getDate() + 7);
                        return d >= now && d <= weekFromNow;
                    }
                    case 'none':
                        return !d;
                    default:
                        if (/^\d{4}-\d{2}$/.test(dueFilter)) {
                            if (!d) return false;
                            const [yr, mo] = dueFilter.split('-').map(Number);
                            return d.getFullYear() === yr && d.getMonth() + 1 === mo;
                        }
                        return true;
                }
            });
    }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, dueFilter, epicId]);


    const dueLabel = (() => {
        if (!dueFilter) return 'All';
        if (/^\d{4}-\d{2}$/.test(dueFilter)) {
            const [yr, mo] = dueFilter.split('-');
            return `${mo}/${yr}`;
        }
        return {overdue: 'Overdue', today: 'Due Today', week: 'Next 7 Days', none: 'No Due Date'}[dueFilter];
    })();

    if (!authorized) return null;

    return (
        <Box
            ref={boxRef}
            id="main-box"
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px' },
                height: '87vh', // ← exactly like BigTasksPage
                mx: 'auto',
                mt: { xs: 1, md: 0 },
                boxSizing: 'border-box',
                backdropFilter: 'blur(18px)',
                background: theme => theme.palette.background.default,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                p: { xs: 3, sm: 2, md: 3 },
            }}
        >

            {isLoading ? (
                <Box sx={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
                    <CircularProgress sx={{ color:"#6C63FF" }} />
                </Box>
            ) : (
                <>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        mb: 3,
                        gap: 2,
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Button
                                onClick={() => navigate(`/projects/${projectId}/big_tasks`)}
                                sx={{minWidth: 0, p: 1, color: '#f1f1f1'}}
                            >
                                <ChevronLeft size={28}/>
                            </Button>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 600, color: '#fff'}}>
                                    {epic ? epic.title : project?.title || 'Project Board'}
                                </Typography>
                                <Typography variant="body2" sx={{color: '#bbb'}}>
                                    {tasks.length} tasks • {tasks.filter(t => t.status === 'Done').length} done
                                </Typography>
                            </Box>
                        </Box>

                        {/* Right side - stacks vertically on mobile */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2,
                            width: { xs: '100%', sm: 'auto' },
                        }}>
                            {/* Action buttons */}
                            {epicId && (
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    flexWrap: 'wrap',
                                }}>
                                    <Button
                                        startIcon={<Users size={18}/>}
                                        onClick={() => setOpenMembersModal(true)}
                                        sx={buttonSx}
                                    >
                                        Members
                                    </Button>
                                    <Button onClick={() => setOpenEpicModal(true)} sx={buttonSx}>
                                        Epic Details
                                    </Button>
                                </Box>
                            )}

                            {/* Progress indicator */}
                            <Box sx={{
                                alignSelf: { xs: 'center', sm: 'auto' },
                                mt: { xs: 1, sm: 0 },
                            }}>
                                <BigTaskProgress
                                    completed={tasks.filter(t => t.status === 'Done').length}
                                    total={tasks.length}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Filter Bar */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            alignItems: 'center',
                            mb: 3,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            backdropFilter: 'blur(8px)',
                            background: theme => theme.palette.background.default,
                            boxShadow: `
      0 2px 12px rgba(0,0,0,0.2),
      0 0 8px rgba(108,99,255,0.2)
    `,
                            width: '100%',
                            justifyContent: 'space-between',
                        }}
                    >

                        {/* Desktop filters */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 1.5,
                                alignItems: 'center',
                                flex: 1,
                            }}
                        >
                            {/* Search */}
                            <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{fontSize: 20, color: '#e0e0e0'}}/>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={filterTextFieldSx}
                            />

                            {/* Status */}
                            <FormControl size="small" sx={filterSelectBoxSx}>
                                <Select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    displayEmpty
                                    variant="outlined"
                                    renderValue={selected =>
                                        selected ? selected : <em>Status</em>
                                    }
                                    sx={filterSelectSx}
                                    inputProps={{ 'aria-label': 'Status' }}
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    <MenuItem value="To Do">To Do</MenuItem>
                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                    <MenuItem value="Review">Review</MenuItem>
                                    <MenuItem value="Done">Done</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Priority */}
                            <FormControl size="small" sx={filterSelectBoxSx}>
                                <Select
                                    value={priorityFilter}
                                    onChange={e => setPriorityFilter(e.target.value)}
                                    displayEmpty
                                    variant="outlined"
                                    renderValue={selected =>
                                        selected ? selected : <em>Priority</em>
                                    }
                                    sx={filterSelectSx}
                                    inputProps={{ 'aria-label': 'Priority' }}
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    <MenuItem value="Highest">Highest</MenuItem>
                                    <MenuItem value="High">High</MenuItem>
                                    <MenuItem value="Medium">Medium</MenuItem>
                                    <MenuItem value="Low">Low</MenuItem>
                                    <MenuItem value="Lowest">Lowest</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Assignee */}
                            <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Assignee by"
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                sx={{...filterTextFieldSx, width: 150}}
                            />

                            <Box>
                                <Button
                                    onClick={openDueMenu}
                                    variant="outlined"
                                    startIcon={<CalendarIcon size={16}/>}
                                    sx={dueButtonSx}
                                >
                                    {dueLabel}
                                </Button>

                                <Menu
                                    anchorEl={dueAnchor}
                                    open={Boolean(dueAnchor)}
                                    onClose={closeDueMenu}
                                    PaperProps={{
                                        sx: dueMenuPaperSx,
                                    }}
                                >
                                    {['', 'overdue', 'today', 'week', 'none'].map(val => (
                                        <MenuItem
                                            key={val}
                                            selected={dueFilter === val}
                                            onClick={() => {
                                                setDueFilter(val);
                                                closeDueMenu();
                                            }}
                                            sx={dueMenuItemSx}
                                        >
                                            {{
                                                '': 'All',
                                                overdue: 'Overdue',
                                                today: 'Due Today',
                                                week: 'Next 7 Days',
                                                none: 'No Due Date',
                                            }[val]}
                                        </MenuItem>
                                    ))}

                                    <Divider sx={dueDividerSx}/>

                                    <Box sx={dueInputBoxSx}>
                                        <Typography variant="subtitle2" sx={dueTypographySx}>
                                            By Month & Year
                                        </Typography>

                                        <TextField
                                            type="month"
                                            value={monthYear}
                                            onChange={e => setMonthYear(e.target.value)}
                                            size="small"
                                            variant="standard"
                                            inputProps={{style: {padding: '10px 12px'}}}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: dueTextFieldSx,
                                            }}
                                            fullWidth
                                        />

                                        <Button
                                            onClick={applyMonthYear}
                                            disabled={!monthYear}
                                            fullWidth
                                            sx={dueApplyButtonSx}
                                        >
                                            Apply
                                        </Button>
                                    </Box>
                                </Menu>
                            </Box>
                        </Box>

                        {/* Right actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<SlidersHorizontal size={16} />}
                                onClick={() => setFiltersOpen(true)}
                                sx={{
                                    display: { xs: 'inline-flex', md: 'none' },
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    '&:hover': { borderColor: '#6C63FF' }
                                }}
                            >
                                Filters
                            </Button>
                            <Button onClick={clearFilters} variant="text"
                                    sx={{color: '#fff', textTransform: 'none', '&:hover': {color: '#6C63FF'}}}>
                                Clear Filters
                            </Button>
                        </Box>
                    </Box>

                    {/* Board */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            pr: 1,
                            mt: -2,

                            // Scrollbar style
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(108,99,255,0.4)',
                                borderRadius: '8px',
                                border: '2px solid transparent',
                                backgroundClip: 'content-box',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: 'rgba(108,99,255,0.7)',
                            },
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(108,99,255,0.4) transparent',
                        }}
                    >

                        <JiraTaskBoard tasks={filteredTasks} onTaskClick={setSelectedTask}/>


                    </Box>
                    {/* Add Task Button (inside main box, under the board) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 24,
                            right: 24,
                            zIndex: 10,
                        }}
                    >

                        <Tooltip title="Create Task">
                            <IconButton
                                onClick={() => setOpenTaskModal(true)}
                                sx={{
                                    background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                                    color: '#fff',
                                    p: 2,
                                    boxShadow: '0 6px 18px rgba(108,99,255,0.5)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a50e0, #8e6cf1)',
                                    },
                                }}
                            >
                                <Plus/>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Modals */}
                    <TaskDetailsModal
                        container={boxRef.current}
                        open={Boolean(selectedTask)}
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        projectTitle={project?.title}
                        onTaskUpdated={handleTaskUpdated}
                    />
                    <CreateTaskModal
                        container={boxRef.current}

                        open={openTaskModal}
                        onClose={() => setOpenTaskModal(false)}
                        onTaskCreated={handleTaskCreated}
                        projectId={projectId}
                        bigTaskId={epicId}
                    />
                    <BigTaskMembersModal
                        container={boxRef.current}

                        open={openMembersModal}
                        onClose={() => setOpenMembersModal(false)}
                        bigTaskId={Number(epicId)}
                    />
                    {epic && (
                        <BigTaskDetailsModal
                            container={boxRef.current}
                            open={openEpicModal}
                            onClose={() => setOpenEpicModal(false)}
                            bigTask={epic}
                            onUpdated={(updatedEpic) => setEpic(updatedEpic)}
                        />
                    )}
                </>
            )}
        </Box>
    );
}
