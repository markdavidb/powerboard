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
    Select,
    MenuItem,
    InputAdornment,
    Menu,
    Divider,
    useMediaQuery,
    useTheme,
    Drawer,
} from '@mui/material';
import {
    ChevronLeft,
    Users,
    Search as SearchIcon,
    Calendar as CalendarIcon,
    Plus,
    SlidersHorizontal,
} from 'lucide-react';
import JiraTaskBoard from '../components/board/JiraTaskBoard';
import TaskDetailsModal from '../components/TaskDetailsModal';
import CreateTaskModal from '../components/CreateTaskModal';
import BigTaskMembersModal from '../components/BigTaskMembersModal';
import BigTaskProgress from '../components/BigTaskProgress';
import BigTaskDetailsModal from '../components/BigTaskDetailsModal';
import ModernFilterMenu from '../components/ModernFilterMenu';
import ModernSelectMenu from '../components/ModernSelectMenu';
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
    const epicId = new URLSearchParams(search).get('epicId');
    const [openEpicModal, setOpenEpicModal] = useState(false);

    const boxRef = useRef(null);

    const [project, setProject] = useState(null);
    const [epic, setEpic] = useState(null);

    // Mobile-specific states
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dueFilter, setDueFilter] = useState('');
    const [dueAnchor, setDueAnchor] = useState(null);
    const [statusAnchor, setStatusAnchor] = useState(null);
    const [priorityAnchor, setPriorityAnchor] = useState(null);
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
        setDueAnchor(null);
        setStatusAnchor(null);
        setPriorityAnchor(null);
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

    // Status and Priority options for modern menus
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Review', label: 'Review' },
        { value: 'Done', label: 'Done' },
    ];

    const priorityOptions = [
        { value: '', label: 'All Priorities' },
        { value: 'Highest', label: 'Highest' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
        { value: 'Lowest', label: 'Lowest' },
    ];

    const statusLabel = statusOptions.find(opt => opt.value === statusFilter)?.label || 'Status';
    const priorityLabel = priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'Priority';

    if (!authorized) return null;

    return (
        <Box
            ref={boxRef}
            id="main-box"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.5, sm: 2, md: 3, lg: 4 }, // Optimized padding
                mt: { xs: 0.5, sm: 1, md: 2 }, // Reduced top margin
                mx: { xs: 0.5, sm: 1, md: "auto" }, // Smaller side margins on mobile
                minHeight: { xs: "calc(100vh - 100px)", md: "90vh" }, // More height usage
                width: { xs: "calc(100vw - 8px)", sm: "calc(100vw - 16px)", md: "100%" }, // Use more viewport width
                maxWidth: { xs: "100%", md: "calc(100vw - 240px)", xl: "1800px" }, // Increased max width
                backdropFilter: "blur(18px)",
                background: theme => theme.palette.background.default,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: { xs: 1, md: 2 }, // MISSING - Smaller border radius on mobile
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                color: "#fff",
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >

            {isLoading ? (
                <Box sx={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
                    <CircularProgress sx={{ color:"#6C63FF" }} />
                </Box>
            ) : (
                <>
                    {/* Header */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        {/* Title and Back Button */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: { xs: 2, sm: 3 },
                            gap: 1,
                        }}>
                            <Button
                                onClick={() => navigate(`/projects/${projectId}/big_tasks`)}
                                sx={{minWidth: 0, p: 1, color: '#f1f1f1'}}
                            >
                                <ChevronLeft size={24}/>
                            </Button>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant={{ xs: 'subtitle1', sm: 'h5', md: 'h4' }}
                                    sx={{
                                        fontWeight: { xs: 600, sm: 700 },
                                        fontSize: { xs: '16px', sm: '20px', md: '24px' },
                                        color: '#fff',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                >
                                    {epic ? epic.title : project?.title || 'Project Board'}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#bbb',
                                        fontSize: { xs: '10px', sm: '12px' },
                                        mt: { xs: 0.5, sm: 0 }
                                    }}
                                >
                                    {tasks.length} tasks • {tasks.filter(t => t.status === 'Done').length} done
                                </Typography>
                            </Box>
                            <Box sx={{ alignSelf: 'flex-start' }}>
                                <BigTaskProgress
                                    completed={tasks.filter(t => t.status === 'Done').length}
                                    total={tasks.length}
                                />
                            </Box>
                        </Box>

                        {/* Action Buttons Row */}
                        {epicId && (
                            <Box sx={{
                                display: 'flex',
                                gap: { xs: 1, sm: 1.5 },
                                mb: { xs: 2, sm: 0 },
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}>
                                <Button
                                    startIcon={<Users size={14}/>}
                                    onClick={() => setOpenMembersModal(true)}
                                    sx={{
                                        ...buttonSx,
                                        fontSize: { xs: '12px', sm: '14px' },
                                        px: { xs: 1.5, sm: 2 },
                                        py: { xs: 0.75, sm: 1 }
                                    }}
                                >
                                    Members
                                </Button>
                                <Button
                                    onClick={() => setOpenEpicModal(true)}
                                    sx={{
                                        ...buttonSx,
                                        fontSize: { xs: '12px', sm: '14px' },
                                        px: { xs: 1.5, sm: 2 },
                                        py: { xs: 0.75, sm: 1 }
                                    }}
                                >
                                    Epic Details
                                </Button>
                            </Box>
                        )}
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
                            justifyContent: 'center', // Center the filters on desktop
                        }}
                    >

                        {/* Desktop filters - centered and compact */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 1, // Reduced gap to make filters closer
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                maxWidth: '1000px', // Limit max width for better centering
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
                                sx={{
                                    ...filterTextFieldSx,
                                    width: 200, // Fixed width for consistency
                                }}
                            />

                            {/* Status */}
                            <Button
                                onClick={e => setStatusAnchor(e.currentTarget)}
                                variant="outlined"
                                sx={dueButtonSx}
                            >
                                {statusLabel}
                            </Button>

                            {/* Priority */}
                            <Button
                                onClick={e => setPriorityAnchor(e.currentTarget)}
                                variant="outlined"
                                sx={dueButtonSx}
                            >
                                {priorityLabel}
                            </Button>

                            {/* Assignee */}
                            <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Assignee"
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                sx={{
                                    ...filterTextFieldSx,
                                    width: 130, // Fixed width for consistency
                                }}
                            />

                            {/* Due Date */}
                            <Button
                                onClick={openDueMenu}
                                variant="outlined"
                                startIcon={<CalendarIcon size={16}/>}
                                sx={{
                                    ...dueButtonSx,
                                    minWidth: 110, // Fixed width for consistency
                                }}
                            >
                                {dueLabel}
                            </Button>
                        </Box>

                        {/* Right actions */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            position: { xs: 'static', md: 'absolute' },
                            right: { xs: 'auto', md: 16 }, // Position absolute on desktop
                        }}>
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
                            {/* Create Task Button - moved here */}
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={() => setOpenTaskModal(true)}
                                sx={{
                                    background: 'linear-gradient(135deg,#6C63FF,#9B78FF)',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: { xs: 1.5, sm: 3 },
                                    py: { xs: 1, sm: 1.25 },
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                                    minWidth: { xs: 44, sm: 'auto' },
                                    '&:hover': {
                                        background: 'linear-gradient(135deg,#5a50e0,#8e6cf1)',
                                        boxShadow: '0 6px 16px rgba(108,99,255,0.5)',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                    '& .MuiButton-startIcon': {
                                        margin: { xs: 0, sm: '0 8px 0 -4px' }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Create Task
                                </Box>
                            </Button>
                        </Box>
                    </Box>

                    {/* Modern Due Date Menu - Moved outside filter bar */}
                    <ModernFilterMenu
                        open={Boolean(dueAnchor)}
                        anchorEl={dueAnchor}
                        onClose={closeDueMenu}
                        value={dueFilter}
                        onChange={setDueFilter}
                        monthYear={monthYear}
                        setMonthYear={setMonthYear}
                        onApplyMonthYear={applyMonthYear}
                    />
                    <ModernSelectMenu
                        open={Boolean(statusAnchor)}
                        anchorEl={statusAnchor}
                        onClose={() => setStatusAnchor(null)}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={statusOptions}
                        title="Filter by Status"
                    />
                    <ModernSelectMenu
                        open={Boolean(priorityAnchor)}
                        anchorEl={priorityAnchor}
                        onClose={() => setPriorityAnchor(null)}
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        options={priorityOptions}
                        title="Filter by Priority"
                    />

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

                    {/* 📱 Mobile Filter Drawer */}
                    <Drawer
                        anchor="bottom"
                        open={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                        PaperProps={{
                            sx: {
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                background: theme => theme.palette.background.default,
                                p: 3,
                            },
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} textAlign="center" mb={2}>
                            Filters
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {/* Search */}
                            <TextField
                                size="small"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon size={18} style={{color: '#bbb'}}/>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    ...filterTextFieldSx,
                                    width: '100%',
                                }}
                                fullWidth
                            />

                            {/* Status - Modern Button */}
                            <Button
                                onClick={e => setStatusAnchor(e.currentTarget)}
                                variant="outlined"
                                sx={{
                                    ...dueButtonSx,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                }}
                                fullWidth
                            >
                                {statusLabel}
                            </Button>

                            {/* Priority - Modern Button */}
                            <Button
                                onClick={e => setPriorityAnchor(e.currentTarget)}
                                variant="outlined"
                                sx={{
                                    ...dueButtonSx,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                }}
                                fullWidth
                            >
                                {priorityLabel}
                            </Button>

                            {/* Assignee */}
                            <TextField
                                size="small"
                                placeholder="Filter by assignee..."
                                value={assigneeFilter}
                                onChange={e => setAssigneeFilter(e.target.value)}
                                sx={{
                                    ...filterTextFieldSx,
                                    width: '100%',
                                }}
                                fullWidth
                            />

                            {/* Due Date */}
                            <Button
                                onClick={openDueMenu}
                                variant="outlined"
                                startIcon={<CalendarIcon size={16}/>}
                                sx={{
                                    ...dueButtonSx,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                }}
                                fullWidth
                            >
                                {dueLabel}
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{mt: 2, background: '#6C63FF'}}
                                onClick={() => setFiltersOpen(false)}
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </Drawer>
                </>
            )}
        </Box>
    );
}
