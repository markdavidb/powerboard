// src/pages/BigTasksPage.jsx

import React, {useEffect, useState, useMemo, useRef} from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Menu,
    Divider,
    IconButton, Tooltip
} from '@mui/material';
import {Search as SearchIcon, Calendar as CalendarIcon, Plus} from 'lucide-react';
import {useParams, useNavigate} from 'react-router-dom';
import {API} from '../api/axios';
import CreateBigTaskModal from '../components/CreateBigTaskModal';
import BigTaskDetailsModal from '../components/BigTaskDetailsModal';
import BigTaskProgress from '../components/BigTaskProgress'; // ✅ New import
import BigTaskCard from '../components/BigTaskCard';

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



export default function BigTasksPage() {
    const {projectId} = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Data
    const [project, setProject] = useState(null);
    const [bigTasks, setBigTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [createOpen, setCreateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dueFilter, setDueFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_desc');

    // Month picker state
    const [dueMenuAnchor, setDueMenuAnchor] = useState(null);
    const [monthYear, setMonthYear] = useState('');
    const completedCount = useMemo(() => bigTasks.filter(t => t.status === 'Done').length, [bigTasks]);
    const [rawSearch, setRawSearch] = useState(searchTerm);

    // 🔥 snappier debounce: 50ms
    useEffect(() => {
        const timeout = setTimeout(() => setSearchTerm(rawSearch), 50);
        return () => clearTimeout(timeout);
    }, [rawSearch]);

    // Fetch project & tasks
    useEffect(() => {
        API.project.get(`/projects/${projectId}`)
            .then(r => setProject(r.data))
            .catch(console.error);
        API.project.get('/projects/big_tasks/big_tasks/', {params: {project_id: projectId, mine_only: true}})
            .then(r => setBigTasks(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [projectId]);

    // Handlers
    const handleCreated = bt => setBigTasks(prev => [bt, ...prev]);

    const handleUpdated = bt => {
        setBigTasks(prev => prev.map(x => (x.id === bt.id ? bt : x)));
        setSelectedTask(bt);

    };

    // **NEW**: remove epic immediately after deletion
    const handleDeleted = id => {
        setBigTasks(prev => prev.filter(bt => bt.id !== id));
        setSelectedTask(null);
        setDetailsOpen(false);
    };

    const openDueMenu = e => setDueMenuAnchor(e.currentTarget);
    const closeDueMenu = () => {
        setDueMenuAnchor(null);
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

        return bigTasks.filter(bt => {
            // 1. Text search
            if (searchTerm && !bt.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // 2. Status filter
            if (statusFilter && bt.status !== statusFilter) {
                return false;
            }

            // 3. Priority filter
            if (priorityFilter && bt.priority !== priorityFilter) {
                return false;
            }

            // 4. Due date filtering
            if (dueFilter) {
                const due = bt.due_date ? new Date(bt.due_date) : null;

                switch (dueFilter) {
                    case 'overdue':
                        return due && due < now;
                    case 'today':
                        return due && due.toDateString() === now.toDateString();
                    case 'week': {
                        if (!due) return false;
                        const weekOut = new Date();
                        weekOut.setDate(now.getDate() + 7);
                        return due >= now && due <= weekOut;
                    }
                    case 'none':
                        return !due;
                    default:
                        if (/^\d{4}-\d{2}$/.test(dueFilter)) {
                            if (!due) return false;
                            const [yr, mo] = dueFilter.split('-').map(Number);
                            return due.getFullYear() === yr && due.getMonth() + 1 === mo;
                        }
                        return true;
                }
            }

            return true;
        });
    }, [bigTasks, searchTerm, statusFilter, priorityFilter, dueFilter]);

// Sorting logic
    const sortedTasks = useMemo(() => {
        const tasks = filteredTasks.slice();
        switch (sortBy) {
            case 'created_asc':
                tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'due_asc':
                tasks.sort((a, b) => {
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date) - new Date(b.due_date);
                });
                break;
            case 'due_desc':
                tasks.sort((a, b) => {
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(b.due_date) - new Date(a.due_date);
                });
                break;
            case 'created_desc':
            default:
                tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        return tasks;
    }, [filteredTasks, sortBy]);

    const dueLabel = (() => {
        if (!dueFilter) return 'All';
        if (/^\d{4}-\d{2}$/.test(dueFilter)) {
            const [yr, mo] = dueFilter.split('-');
            return `${mo}/${yr}`;
        }
        return {
            overdue: 'Overdue',
            today: 'Due Today',
            week: 'Next 7 Days',
            none: 'No Due Date',
        }[dueFilter];
    })();

    if (loading) {
        return (
            <Box
                sx={{
                    width: '100%',
                    maxWidth: {xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px'},
                    minHeight: '87vh',
                    mx: 'auto',
                    mt: { xs: 1, md: 0 },
                    boxSizing: 'border-box',
                    backdropFilter: 'blur(18px)',
                    background: theme => theme.palette.background.default,  // ← use your theme
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 1, sm: 2, md: 4 },
                }}
            >
                <CircularProgress sx={{ color: '#6C63FF' }} />
            </Box>
        );
    }


    // MAIN BOX (replace current)
    return (
        <Box
            ref={containerRef}
            id="main-box"
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px' },
                height: '87vh', // <- force height, NOT minHeight!
                mx: 'auto',
                mt: { xs: 1, md: 0},
                boxSizing: 'border-box',
                backdropFilter: 'blur(18px)',
                background: theme => theme.palette.background.default,  // ← use your theme
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                p: { xs: 3, sm: 2, md: 3 },
            }}
        >
            {/* ✅ Updated Header */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                {/* Left: Project title and subtitle */}
                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            p: 1,
                            fontSize: '2.5rem',
                            color: '#ffffff',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontFamily: '"Poppins", "Roboto", sans-serif',
                            textShadow: '0 0 8px rgba(255,255,255,0.1), 0 0 12px rgba(255,255,255,0.15)',
                            animation: 'pulse 3s ease-in-out infinite',
                            '@keyframes pulse': {
                                '0%': {textShadow: '0 0 6px rgba(255,255,255,0.15)'},
                                '50%': {textShadow: '0 0 18px rgba(255,255,255,0.4)'},
                                '100%': {textShadow: '0 0 6px rgba(255,255,255,0.15)'},
                            }
                        }}
                    >
                        {project?.title || ''}
                    </Typography>


                    <Typography variant="body2" sx={{color: '#bbb', fontSize: '1rem', fontWeight: 500,p:1}}>
                        {bigTasks.length} epics • {completedCount} done
                    </Typography>
                </Box>

                {/* Right: Button and progress aligned apart */}
                <Box sx={{display: 'flex', alignItems: 'center', width: 'fit-content'}}>

                    <Box sx={{ml: 'auto'}}>
                        <BigTaskProgress completed={completedCount} total={bigTasks.length}/>
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
                    mb: 4,
                    px: 2,
                    py: 1,
                    backdropFilter: 'blur(8px)',
                    background: theme => theme.palette.background.default,
                    boxShadow: `
      0 2px 12px rgba(0,0,0,0.2),
      0 0 8px rgba(108,99,255,0.2)
    `,
                    width: '100%',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'center', // always center horizontally
                        width: '100%',
                    }}
                >
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search epics..."
                        value={searchTerm}
                        onChange={e => setRawSearch(e.target.value)}
                        inputProps={{
                            autoComplete: 'off',
                            tabIndex: -1,           // ← this helps prevent random focus when clicking around
                        }}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon size={18} style={{color: '#bbb'}}/>
                                </InputAdornment>
                            ),
                        }}
                        sx={filterTextFieldSx}
                    />

                    <FormControl size="small" sx={filterSelectBoxSx}>
                        <Select
                            value={sortBy}                               // '' means default order
                            onChange={e => setSortBy(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            renderValue={selected =>
                                selected
                                    ? (
                                        {
                                            created_desc: 'Newest Created',
                                            created_asc: 'Oldest Created',
                                            due_asc:     'Soonest Due',
                                            due_desc:    'Latest Due',
                                        }[selected]          // human-readable label
                                    )
                                    : <em>Sort By</em>       // placeholder when value === ''
                            }
                            sx={filterSelectSx}
                            inputProps={{ 'aria-label': 'Sort By' }}
                        >
                            <MenuItem value="">
                                <em>Default</em>           {/* reset to API / natural order */}
                            </MenuItem>
                            <MenuItem value="created_desc">Newest Created</MenuItem>
                            <MenuItem value="created_asc">Oldest Created</MenuItem>
                            <MenuItem value="due_asc">Soonest Due</MenuItem>
                            <MenuItem value="due_desc">Latest Due</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={filterSelectBoxSx}>
                        <Select
                            value={statusFilter}                     // ''  means “no filter”
                            onChange={e => setStatusFilter(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            renderValue={selected =>
                                selected ? selected : <em>Status</em>  // placeholder when value === ''
                            }
                            sx={filterSelectSx}
                            inputProps={{ 'aria-label': 'Status' }}
                        >
                            {/* All / reset option – *not* disabled */}
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>

                            <MenuItem value="To Do">To Do</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                        </Select>
                    </FormControl>

                    {/* ───────────── Priority ───────────── */}
                    <FormControl size="small" sx={filterSelectBoxSx}>
                        <Select
                            value={priorityFilter}                      // '' shows all priorities
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
                            anchorEl={dueMenuAnchor}
                            open={Boolean(dueMenuAnchor)}
                            onClose={closeDueMenu}
                            PaperProps={{sx: dueMenuPaperSx}}
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
                                    variant="filled"
                                    inputProps={{autoComplete: 'off', tabIndex: -1}}

                                    InputProps={{
                                        disableUnderline: true,
                                        sx: dueTextFieldSx
                                    }}
                                    fullWidth
                                />
                                <Button
                                    onClick={applyMonthYear}
                                    fullWidth
                                    disabled={!monthYear}
                                    sx={dueApplyButtonSx}
                                >
                                    Apply
                                </Button>
                            </Box>
                        </Menu>
                    </Box>

                    <Button
                        onClick={clearFilters}
                        variant="text"
                        sx={{
                            color: '#fff',
                            textTransform: 'none',
                            '&:hover': {color: '#6C63FF'}
                        }}
                    >
                        Clear Filters
                    </Button>
                </Box>
            </Box>

            {/* Scrollable Content Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pb: 2,
                    mt: 0,
                    userSelect: 'none',
                    pointerEvents: 'auto',
                    outline: 'none !important',
                    '&:focus': {
                        outline: 'none !important',
                    },
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
                tabIndex={-1}
                onMouseDown={e => e.preventDefault()}
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress sx={{ color: '#6C63FF' }} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1800px' },
                            mx: 'auto',
                            pt: 1,
                        }}
                    >  <Grid container columnSpacing={1.5} rowSpacing={1} sx={{ width: '100%', ml: 5 }}>
                        {sortedTasks.map(bt => (
                            <Grid item xs={12} sm={6} md={3} key={bt.id}>
                                <BigTaskCard
                                    bt={bt}
                                    onNavigate={() => navigate(`/projects/${projectId}/board?epicId=${bt.id}`)}
                                    onDetails={() => {
                                        setSelectedTask(bt);
                                        setDetailsOpen(true);
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    </Box>

                )}
            </Box>

            {/* Modals */}
            <CreateBigTaskModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                projectId={projectId}
                onCreated={handleCreated}
            />
            {selectedTask && (
                <BigTaskDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    bigTask={selectedTask}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}    // ← Pass the delete callback here
                    container={containerRef.current}
                />
            )}
            <Tooltip title="Create Epic">
                <IconButton
                    onClick={() => setCreateOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 70,
                        background: 'linear-gradient(135deg, #6C63FF, #9B78FF)',
                        color: '#fff',
                        p: 2,
                        zIndex: 999,
                        boxShadow: '0 6px 18px rgba(108,99,255,0.5)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a50e0, #8e6cf1)',
                        }
                    }}
                >
                    <Plus/>
                </IconButton>
            </Tooltip>

        </Box>
    );
}

// color helpers
function statusColor(status) {
    switch (status) {
        case 'Done':
            return {bg: 'rgba(76,175,80,0.2)', fg: '#4caf50'};
        case 'In Progress':
            return {bg: 'rgba(33,150,243,0.2)', fg: '#2196f3'};
        default:
            return {bg: 'rgba(158,158,158,0.2)', fg: '#9e9e9e'};
    }
}

function priorityColor(prio) {
    switch (prio) {
        case 'Highest':
            return {bg: 'rgba(244,67,54,0.2)', fg: '#f44336'};
        case 'High':
            return {bg: 'rgba(255,152,0,0.2)', fg: '#ff9800'};
        case 'Low':
            return {bg: 'rgba(156,39,176,0.2)', fg: '#9c27b0'};
        case 'Lowest':
            return {bg: 'rgba(96,125,139,0.2)', fg: '#607d8b'};
        default:
            return {bg: 'rgba(158,158,158,0.2)', fg: '#9e9e9e'};
    }
}
