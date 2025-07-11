// ──────────────────────────────────────────────────────────────
// src/pages/BigTasksPage.jsx  • Responsive with Filter Drawer
// ──────────────────────────────────────────────────────────────
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, CircularProgress, TextField, FormControl,
  Select, MenuItem, InputAdornment, Menu, Divider, IconButton,
  Tooltip, Drawer
} from '@mui/material';
import { Search as SearchIcon, Calendar as CalendarIcon, Plus, SlidersHorizontal } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../api/axios';
import CreateBigTaskModal from '../components/CreateBigTaskModal';
import BigTaskDetailsModal from '../components/BigTaskDetailsModal';
import BigTaskProgress from '../components/BigTaskProgress';
import BigTaskCard from '../components/BigTaskCard';

import {
  filterTextFieldSx, filterSelectBoxSx, filterSelectSx,
  dueButtonSx, dueMenuPaperSx, dueMenuItemSx, dueDividerSx,
  dueInputBoxSx, dueTypographySx, dueTextFieldSx, dueApplyButtonSx,
} from '../themes/filterStyles';

export default function BigTasksPage() {
  const { projectId } = useParams();
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
  const [monthYear, setMonthYear] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            params: { project_id: projectId, mine_only: true }
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
          case 'overdue': return due && due < now;
          case 'today': return due && due.toDateString() === now.toDateString();
          case 'week': {
            if (!due) return false;
            const weekOut = new Date(); weekOut.setDate(now.getDate() + 7);
            return due >= now && due <= weekOut;
          }
          case 'none': return !due;
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
      case 'created_asc': return list.sort((a, b) => cmp(a, b, 'created_at', true));
      case 'due_asc': return list.sort((a, b) => cmp(a, b, 'due_date', true));
      case 'due_desc': return list.sort((a, b) => cmp(a, b, 'due_date', false));
      default: return list.sort((a, b) => cmp(a, b, 'created_at', false));
    }
  }, [filtered, sortBy]);

  const dueLabel = (() => {
    if (!dueFilter) return 'All';
    if (/^\d{4}-\d{2}$/.test(dueFilter)) {
      const [y, m] = dueFilter.split('-');
      return `${m}/${y}`;
    }
    return { overdue: 'Overdue', today: 'Due Today', week: 'Next 7 Days', none: 'No Due Date' }[dueFilter];
  })();

  const clearFilters = () => {
    setRawSearch('');
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setDueFilter('');
    setMonthYear('');
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '88vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  return (
    <Box
      id="main-box"
      ref={containerRef}
      sx={{
        display: 'flex', flexDirection: 'column',
        p: { xs: 2, sm: 3, md: 4, lg: 6 },
        mt: { xs: 1, sm: 2, md: 3 },
        mx: { xs: 1, sm: 2, md: 'auto' },
        minHeight: { xs: 'calc(100vh - 120px)', md: '88vh' },
        width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)', md: '100%' },
        maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px' },
        backdropFilter: 'blur(18px)',
        background: t => t.palette.background.default,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: { xs: 2, md: 3 },
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        color: '#fff',
      }}
    >
      {/* header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        mb: 3,
        gap: 2,
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {project?.title || ''}
          </Typography>
          <Typography variant="body2" color="#bbb" ml={0.5}>
            {bigTasks.length} epics • {doneCount} done
          </Typography>
        </Box>
        <BigTaskProgress completed={doneCount} total={bigTasks.length} />
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
            display: { xs: 'none', md: 'flex' },
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
                  <SearchIcon size={18} style={{ color: '#bbb' }} />
                </InputAdornment>
              ),
            }}
            sx={filterTextFieldSx}
          />
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="created_desc">Newest Created</MenuItem>
              <MenuItem value="created_asc">Oldest Created</MenuItem>
              <MenuItem value="due_asc">Soonest Due</MenuItem>
              <MenuItem value="due_desc">Latest Due</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Highest">Highest</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Lowest">Lowest</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={e => setDueAnchor(e.currentTarget)}
            variant="outlined"
            startIcon={<CalendarIcon size={16} />}
            sx={dueButtonSx}
          >
            {dueLabel}
          </Button>
        </Box>

        {/* right: filter toggle & clear */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* mobile filter toggle */}
          <Button
            variant="outlined"
            startIcon={<SlidersHorizontal size={16} />}
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            Filters
          </Button>
          <Button onClick={clearFilters} sx={{ color: '#fff', textTransform: 'none' }}>
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* epic grid */}
     <Box
  sx={{
    flex: 1,
    overflowY: 'auto',
    pr: 1,
    "&::-webkit-scrollbar": { width: 8 },
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
      gap: { xs: 1, sm: 1.5 },
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


      {/* create epic button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Tooltip title="Create Epic">
          <IconButton
            onClick={() => setCreateOpen(true)}
            sx={{
              background: 'linear-gradient(135deg,#6C63FF,#9B78FF)',
              color: '#fff', p: 2,
              '&:hover': { background: 'linear-gradient(135deg,#5a50e0,#8e6cf1)' },
            }}
          >
            <Plus />
          </IconButton>
        </Tooltip>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Repeat same filters as above */}
          <TextField
            size="small"
            placeholder="Search epics…"
            value={rawSearch}
            onChange={e => setRawSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={18} style={{ color: '#bbb' }} />
                </InputAdornment>
              ),
            }}
            sx={filterTextFieldSx}
          />
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="created_desc">Newest Created</MenuItem>
              <MenuItem value="created_asc">Oldest Created</MenuItem>
              <MenuItem value="due_asc">Soonest Due</MenuItem>
              <MenuItem value="due_desc">Latest Due</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={filterSelectBoxSx}>
            <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} displayEmpty sx={filterSelectSx}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Highest">Highest</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Lowest">Lowest</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={e => setDueAnchor(e.currentTarget)}
            variant="outlined"
            startIcon={<CalendarIcon size={16} />}
            sx={dueButtonSx}
          >
            {dueLabel}
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, background: '#6C63FF' }}
            onClick={() => setDrawerOpen(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
