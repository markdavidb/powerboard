// ──────────────────────────────────────────────────────────────
// src/pages/BigTasksPage.jsx  • Responsive with Filter Drawer
// ──────────────────────────────────────────────────────────────
import React, {useEffect, useState, useMemo, useRef} from 'react';
import {
    Box, Typography, Button, CircularProgress, TextField, FormControl,
    Select, MenuItem, InputAdornment, Menu, Divider, IconButton,
    Tooltip, Drawer
} from '@mui/material';
import {Search as SearchIcon, Calendar as CalendarIcon, Plus, SlidersHorizontal} from 'lucide-react';
import {useParams, useNavigate} from 'react-router-dom';
import {API} from '../api/axios';
import CreateBigTaskModal from '../components/CreateBigTaskModal';
import BigTaskDetailsModal from '../components/BigTaskDetailsModal';
import BigTaskProgress from '../components/BigTaskProgress';
import BigTaskCard from '../components/BigTaskCard';
import ModernFilterMenu from '../components/ModernFilterMenu';
import ModernSelectMenu from '../components/ModernSelectMenu';

import {
    filterTextFieldSx, filterSelectBoxSx, filterSelectSx, dueButtonSx
} from '../themes/filterStyles';

export default function BigTasksPage() {
    const {projectId} = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [project, setProject] = useState(null);
    const [bigTasks, setBigTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [rawSearch, setRawSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dueFilter, setDueFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_desc');

    const [dueAnchor, setDueAnchor] = useState(null);
    const [sortAnchor, setSortAnchor] = useState(null);
    const [statusAnchor, setStatusAnchor] = useState(null);
    const [priorityAnchor, setPriorityAnchor] = useState(null);

    const [monthYear, setMonthYear] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const sortOptions = [
        { value: 'created_desc', label: 'Newest Created' },
        { value: 'created_asc', label: 'Oldest Created' },
        { value: 'due_asc', label: 'Soonest Due' },
        { value: 'due_desc', label: 'Latest Due' },
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
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

    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(rawSearch), 50);
        return () => clearTimeout(t);
    }, [rawSearch]);

    useEffect(() => {
        async function load() {
            try {
                const [projR, tasksR] = await Promise.all([
                    API.project.get(`/projects/${projectId}`),
                    API.project.get('/projects/big_tasks/big_tasks/', {
                        params: {project_id: projectId, mine_only: true}
                    }),
                ]);
                setProject(projR.data);
                setBigTasks(tasksR.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [projectId]);

    const doneCount = useMemo(() => bigTasks.filter(t => t.status === 'Done').length, [bigTasks]);

    const filtered = useMemo(() => {
        const now = new Date();
        return bigTasks.filter(bt => {
            if (searchTerm && !bt.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (statusFilter && bt.status !== statusFilter) return false;
            if (priorityFilter && bt.priority !== priorityFilter) return false;

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
                        if (/^\d{4}-\d{2}$/.test(dueFilter) && due) {
                            const [y, m] = dueFilter.split('-').map(Number);
                            return due.getFullYear() === y && due.getMonth() + 1 === m;
                        }
                        return true;
                }
            }
            return true;
        });
    }, [bigTasks, searchTerm, statusFilter, priorityFilter, dueFilter]);

    const sorted = useMemo(() => {
        const list = [...filtered];
        const cmp = (a, b, key, asc = true) =>
            (asc ? +new Date(a[key]) - +new Date(b[key]) : +new Date(b[key]) - +new Date(a[key]));
        switch (sortBy) {
            case 'created_asc':
                return list.sort((a, b) => cmp(a, b, 'created_at', true));
            case 'due_asc':
                return list.sort((a, b) => cmp(a, b, 'due_date', true));
            case 'due_desc':
                return list.sort((a, b) => cmp(a, b, 'due_date', false));
            default:
                return list.sort((a, b) => cmp(a, b, 'created_at', false));
        }
    }, [filtered, sortBy]);

    const dueLabel = (() => {
        if (!dueFilter) return 'All';
        if (/^\d{4}-\d{2}$/.test(dueFilter)) {
            const [y, m] = dueFilter.split('-');
            return `${m}/${y}`;
        }
        return {overdue: 'Overdue', today: 'Due Today', week: 'Next 7 Days', none: 'No Due Date'}[dueFilter];
    })();

    const sortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By';
    const statusLabel = statusOptions.find(opt => opt.value === statusFilter)?.label || 'Status';
    const priorityLabel = priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'Priority';

    const clearFilters = () => {
        setRawSearch('');
        setSearchTerm('');
        setStatusFilter('');
        setPriorityFilter('');
        setDueFilter('');
        setMonthYear('');
        setDueAnchor(null);
        setSortAnchor(null);
        setStatusAnchor(null);
        setPriorityAnchor(null);
    };

    const closeDueMenu = () => {
        setDueAnchor(null);
        setMonthYear('');
    };

    const applyMonthYear = () => {
        if (monthYear) setDueFilter(monthYear);
        closeDueMenu();
    };

    if (loading) {
        return (
            <Box sx={{
                width: '100%',
                minHeight: '88vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress sx={{color: '#6C63FF'}}/>
            </Box>
        );
    }

    return (
        <Box
            id="main-box"
            ref={containerRef}
            sx={{
                display: 'flex', flexDirection: 'column',
                p: { xs: 1.5, sm: 2, md: 3, lg: 4 }, // Optimized padding
                mt: { xs: 0.5, sm: 1, md: 2 }, // Reduced top margin
                mx: { xs: 0.5, sm: 1, md: 'auto' }, // Smaller side margins on mobile
                minHeight: { xs: 'calc(100vh - 100px)', md: '90vh' }, // More height usage
                width: { xs: 'calc(100vw - 8px)', sm: 'calc(100vw - 16px)', md: '100%' }, // Use more viewport width
                maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1800px' }, // Increased max width
                backdropFilter: 'blur(18px)',
                background: t => t.palette.background.default,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: { xs: 1, md: 2 }, // Smaller border radius on mobile
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                color: '#fff',
            }}
        >
            {/* header */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start', // align to top instead of center
                justifyContent: 'space-between',
                mb: {xs: 2, sm: 3},
                gap: {xs: 1, sm: 2},
                minHeight: 48, // ensure consistent height
            }}>
                <Box sx={{flex: 1, minWidth: 0, mr: 1}}> {/* add right margin */}
                    <Typography
                        variant={{xs: 'subtitle1', sm: 'h5', md: 'h4'}}
                        fontWeight={{xs: 500, sm: 800}}
                        sx={{
                            fontSize: {xs: '16px', sm: '20px', md: '24px'},
                            lineHeight: {xs: 1.3, sm: 1.4}, // slightly more space
                            wordBreak: 'break-word', // allow title to break
                            overflowWrap: 'break-word',
                            hyphens: 'auto', // add hyphenation
                            maxWidth: '100%'
                        }}
                    >
                        {project?.title || ''}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="#bbb"
                        sx={{
                            ml: 0.5,
                            fontSize: {xs: '10px', sm: '12px'},
                            mt: {xs: 0.5, sm: 0}, // add small top margin on mobile
                            fontWeight: {xs: 400, sm: 500},
                            wordBreak: 'break-word'
                        }}
                    >
                        {bigTasks.length} epics • {doneCount} done
                    </Typography>
                </Box>
                <Box sx={{
                    flexShrink: 0,
                    alignSelf: 'flex-start', // keep progress at top
                    position: 'relative',
                    mt: -1,
                    zIndex: 1 // ensure it stays above other elements
                }}>
                    <BigTaskProgress completed={doneCount} total={bigTasks.length}/>
                </Box>
            </Box>

            {/* filters header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                {/* left: desktop filters */}
                <Box
                    sx={{
                        display: {xs: 'none', md: 'flex'},
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search epics…"
                        value={rawSearch}
                        onChange={e => setRawSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon size={18} style={{color: '#bbb'}}/>
                                </InputAdornment>
                            ),
                        }}
                        sx={filterTextFieldSx}
                    />
                    <Button
                        onClick={e => setSortAnchor(e.currentTarget)}
                        variant="outlined"
                        sx={dueButtonSx}
                    >
                        {sortLabel}
                    </Button>
                    <Button
                        onClick={e => setStatusAnchor(e.currentTarget)}
                        variant="outlined"
                        sx={dueButtonSx}
                    >
                        {statusLabel}
                    </Button>
                    <Button
                        onClick={e => setPriorityAnchor(e.currentTarget)}
                        variant="outlined"
                        sx={dueButtonSx}
                    >
                        {priorityLabel}
                    </Button>
                    <Button
                        onClick={e => setDueAnchor(e.currentTarget)}
                        variant="outlined"
                        startIcon={<CalendarIcon size={16}/>}
                        sx={dueButtonSx}
                    >
                        {dueLabel}
                    </Button>
                </Box>

                {/* right: filter toggle & clear */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, ml: 'auto'}}>
                    {/* mobile filter toggle */}
                    <Button
                        variant="outlined"
                        startIcon={<SlidersHorizontal size={14}/>}
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            display: {xs: 'inline-flex', md: 'none'},
                            minWidth: 'auto',
                            px: {xs: 1.5, sm: 2},
                            py: {xs: 0.5, sm: 0.75},
                            fontSize: {xs: '12px', sm: '14px'},
                            fontWeight: 500,
                            height: {xs: 32, sm: 36},
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            '&:hover': {
                                borderColor: 'rgba(255,255,255,0.3)',
                                backgroundColor: 'rgba(255,255,255,0.05)'
                            }
                        }}
                    >
                        <span style={{display: {xs: 'none', sm: 'inline'}}}>Filters</span>
                    </Button>
                    {(rawSearch || statusFilter || priorityFilter || dueFilter) && (
                        <Button onClick={clearFilters} sx={{
                            color: '#bbb',
                            textTransform: 'none',
                            fontSize: {xs: 11, sm: 12},
                            minWidth: 'auto',
                            px: {xs: 1, sm: 1.5},
                            py: {xs: 0.25, sm: 0.5}
                        }}>
                            Clear
                        </Button>
                    )}
                    {/* Create Epic Button - moved here */}
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18}/>}
                        onClick={() => setCreateOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg,#6C63FF,#9B78FF)',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: {xs: 1.5, sm: 3},
                            py: {xs: 1, sm: 1.25},
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                            minWidth: {xs: 44, sm: 'auto'},
                            '&:hover': {
                                background: 'linear-gradient(135deg,#5a50e0,#8e6cf1)',
                                boxShadow: '0 6px 16px rgba(108,99,255,0.5)',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                            '& .MuiButton-startIcon': {
                                margin: {xs: 0, sm: '0 8px 0 -4px'}
                            }
                        }}
                    >
                        <Box sx={{display: {xs: 'none', sm: 'inline'}}}>
                            Create Epic
                        </Box>
                    </Button>
                </Box>
            </Box>

            {/* Modern Due Date Filter Menu - Moved outside filter container */}
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
                open={Boolean(sortAnchor)}
                anchorEl={sortAnchor}
                onClose={() => setSortAnchor(null)}
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                title="Sort by"
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

            {/* epic grid */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                    p:0.5,
                    // for debugging
                    "&::-webkit-scrollbar": {width: 8},
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(108,99,255,0.4)",
                        borderRadius: 8,
                        border: "2px solid transparent",
                        backgroundClip: "content-box",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "rgba(108,99,255,0.7)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(auto-fit, minmax(280px, 1fr))",
                            sm: "repeat(auto-fit, minmax(300px, 1fr))",
                        },
                        gap: {xs: 1, sm: 1.5},
                        mt: 1,
                        ml: 1.5,
                        justifyItems: "center",
                    }}
                >
                    {sorted.map(bt => (
                        <BigTaskCard
                            key={bt.id}
                            bt={bt}
                            onNavigate={() => navigate(`/projects/${projectId}/board?epicId=${bt.id}`)}
                            onDetails={() => {
                                setSelected(bt);
                                setDetailsOpen(true);
                            }}
                        />
                    ))}
                </Box>
            </Box>


            {/* modals */}
            <CreateBigTaskModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                projectId={projectId}
                onCreated={bt => setBigTasks(prev => [bt, ...prev])}
            />
            {selected && (
                <BigTaskDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    bigTask={selected}
                    onUpdated={bt => setBigTasks(prev => prev.map(x => x.id === bt.id ? bt : x))}
                    onDeleted={id => {
                        setBigTasks(prev => prev.filter(x => x.id !== id));
                        setSelected(null);
                        setDetailsOpen(false);
                    }}
                    container={containerRef.current}
                />
            )}

            {/* 📱 mobile filter drawer */}
            <Drawer
                anchor="bottom"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        background: t => t.palette.background.default,
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
                        placeholder="Search epics…"
                        value={rawSearch}
                        onChange={e => setRawSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon size={18} style={{color: '#bbb'}}/>
                                </InputAdornment>
                            ),
                        }}
                        sx={filterTextFieldSx}
                    />

                    {/* Sort - Modern Button */}
                    <Button
                        onClick={e => setSortAnchor(e.currentTarget)}
                        variant="outlined"
                        sx={{
                            ...dueButtonSx,
                            width: '100%',
                            justifyContent: 'flex-start',
                        }}
                        fullWidth
                    >
                        {sortLabel}
                    </Button>

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

                    {/* Due Date */}
                    <Button
                        onClick={e => setDueAnchor(e.currentTarget)}
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
                        onClick={() => setDrawerOpen(false)}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}
