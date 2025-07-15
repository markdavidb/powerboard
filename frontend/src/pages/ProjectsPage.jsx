// src/pages/ProjectsPage.jsx

import React, {useEffect, useState, useMemo, useRef} from "react";
import {
    Box, Typography, TextField, MenuItem, IconButton, Tooltip,
    CircularProgress, Button, Drawer, InputAdornment
} from "@mui/material";
import {
    Plus, SlidersHorizontal, Calendar as CalendarIcon,
    Search as SearchIcon, ChevronDown
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import {API} from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";
import ModernSelectMenu from "../components/ModernSelectMenu";
import ModernYearPicker from "../components/ModernYearPicker";
import ModernMonthPicker from "../components/ModernMonthPicker";

const filterStyle = {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    minWidth: 150,
    input: {color: "#fff"},
    "& .MuiInputLabel-root": {color: "#aaa"},
    "& .MuiSvgIcon-root": {color: "#aaa"},
    "& fieldset": {border: "none"},
};

const emptyStats = Object.freeze({total: 0, done: 0});

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [btStats, setBtStats] = useState({});
    const [loadingProjects, setLoadingProjects] = useState(true);
    const loadingStats = projects.length > 0 && Object.keys(btStats).length < projects.length;
    const loading = loadingProjects || loadingStats;

    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Modern menu anchors
    const [monthAnchor, setMonthAnchor] = useState(null);
    const [yearAnchor, setYearAnchor] = useState(null);
    const [statusAnchor, setStatusAnchor] = useState(null);

    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const containerRef = useRef(null);

    useEffect(() => {
        API.project
            .get("/projects/")
            .then((r) => setProjects(r.data))
            .catch(console.error)
            .finally(() => setLoadingProjects(false));
    }, []);

    useEffect(() => {
        if (!projects.length) return;
        const controller = new AbortController();

        // Single API call to get ALL big tasks for all accessible projects
        API.project.get("/projects/big_tasks/big_tasks/", {
            params: { mine_only: false },
            signal: controller.signal,
        })
            .then((response) => {
                const allBigTasks = response.data;
                const stats = {};

                // Initialize stats for all projects
                projects.forEach(project => {
                    stats[project.id] = { total: 0, done: 0 };
                });

                // Calculate stats from the bulk data
                allBigTasks.forEach((bigTask) => {
                    const projectId = bigTask.project_id;
                    if (stats[projectId]) {
                        stats[projectId].total++;
                        if (bigTask.status === "Done") {
                            stats[projectId].done++;
                        }
                    }
                });

                setBtStats(stats);
            })
            .catch((err) => {
                if (err.name !== "CanceledError") console.error(err);
            });

        return () => controller.abort();
    }, [projects]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthOptions = monthNames.map((l, i) => ({value: String(i + 1), label: l}));
    const currentYear = new Date().getFullYear();

    // Generate a much wider year range: from 50 years ago to 100 years in the future
    const startYear = currentYear - 50;
    const endYear = currentYear + 100;
    const yearOptions = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);

    const statusOptions = useMemo(() =>
        Array.from(new Set(projects.map(p => p.status))).filter(Boolean), [projects]);

    // Modern menu options
    const modernMonthOptions = [
        { value: '', label: 'All Months' },
        ...monthOptions
    ];

    const modernYearOptions = [
        { value: '', label: 'All Years' },
        ...yearOptions.map(y => ({ value: String(y), label: String(y) }))
    ];

    const modernStatusOptions = [
        { value: '', label: 'All Statuses' },
        ...statusOptions.map(s => ({ value: s, label: s }))
    ];

    // Labels for modern menu buttons
    const monthLabel = modernMonthOptions.find(opt => opt.value === filterMonth)?.label || 'Month';
    const yearLabel = modernYearOptions.find(opt => opt.value === filterYear)?.label || 'Year';
    const statusLabel = modernStatusOptions.find(opt => opt.value === filterStatus)?.label || 'Status';

    const filtered = useMemo(() => {
        return projects
            .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((p) => {
                if (!filterMonth && !filterYear) return true;
                if (!p.due_date) return false;
                const d = new Date(p.due_date);
                if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
                if (filterMonth && d.getMonth() + 1 !== Number(filterMonth)) return false;
                return true;
            })
            .filter((p) => (filterStatus ? p.status === filterStatus : true));
    }, [projects, searchTerm, filterMonth, filterYear, filterStatus]);

    const handleProjectCreated = (proj) => {
        setProjects((prev) => [proj, ...prev]);
        setBtStats((prev) => ({...prev, [proj.id]: emptyStats}));
        enqueueSnackbar("Project created successfully!", {variant: "success"});
    };

    const openProject = (id) => navigate(`/projects/${id}/summary`);
    const clearFilters = () => {
        setSearchTerm("");
        setFilterMonth("");
        setFilterYear("");
        setFilterStatus("");
    };

    return (
        <Box
            id="main-box"
            ref={containerRef}
            sx={{
                display: "flex",
                flexDirection: "column",
                p: { xs: 1.5, sm: 2, md: 3, lg: 4 }, // Optimized padding
                mt: { xs: 0.5, sm: 1, md: 2 }, // Reduced top margin
                mx: { xs: 0.5, sm: 1, md: "auto" }, // Smaller side margins on mobile
                minHeight: { xs: "calc(100vh - 100px)", md: "90vh" }, // More height usage
                width: { xs: "calc(100vw - 8px)", sm: "calc(100vw - 16px)", md: "100%" }, // Use more viewport width
                maxWidth: { xs: "100%", md: "calc(100vw - 240px)", xl: "1800px" }, // Increased max width
                backdropFilter: "blur(18px)",
                background: (t) => t.palette.background.default,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: { xs: 1, md: 2 }, // Smaller border radius on mobile
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                color: "#fff",
            }}
        >
            {loading ? (
                <Box sx={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress sx={{color: "#6C63FF"}}/>
                </Box>
            ) : (
                <>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        mb={4}
                        sx={{
                            textShadow: "0 0 10px #6C63FF88",
                            fontSize: {xs: '1.5rem', sm: '2rem', md: '2.125rem'}
                        }}
                    >
                        My Projects
                    </Typography>

                    {/* ─────────────── Filter toolbar ─────────────── */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        {/* Desktop filters */}
                        <Box
                            sx={{
                                display: {xs: "none", md: "grid"},
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: 2,
                                flex: 1,
                            }}
                        >
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search projects…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={filterStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon size={16} style={{color: "#aaa"}}/>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Month - Modern Button */}
                            <Button
                                onClick={e => setMonthAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {monthLabel}
                            </Button>

                            {/* Year - Modern Button */}
                            <Button
                                onClick={e => setYearAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {yearLabel}
                            </Button>

                            {/* Status - Modern Button */}
                            <Button
                                onClick={e => setStatusAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {statusLabel}
                            </Button>
                        </Box>

                        {/* Right actions */}
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Button
                                variant="outlined"
                                startIcon={<SlidersHorizontal size={16}/>}
                                onClick={() => setDrawerOpen(true)}
                                sx={{display: {xs: "inline-flex", md: "none"}}}
                            >
                                Filters
                            </Button>
                            <Button onClick={clearFilters} sx={{color: "#fff", textTransform: "none"}}>
                                Clear Filters
                            </Button>
                            {/* Create Project Button - moved here */}
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18}/>}
                                onClick={() => setModalOpen(true)}
                                sx={{
                                    background: "linear-gradient(135deg,#6C63FF,#9B78FF)",
                                    color: "#fff",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: {xs: 1.5, sm: 3}, // less padding on mobile
                                    py: {xs: 1, sm: 1.25},
                                    borderRadius: 2,
                                    boxShadow: "0 4px 12px rgba(108,99,255,0.4)",
                                    minWidth: {xs: 44, sm: 'auto'}, // fixed width on mobile for centering
                                    "&:hover": {
                                        background: "linear-gradient(135deg,#5a50e0,#8e6cf1)",
                                        boxShadow: "0 6px 16px rgba(108,99,255,0.5)",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                    // Hide startIcon margin on mobile and center the icon
                                    "& .MuiButton-startIcon": {
                                        margin: {xs: 0, sm: '0 8px 0 -4px'}
                                    }
                                }}
                            >
                                <Box sx={{display: {xs: "none", sm: "inline"}}}>
                                    Create Project
                                </Box>
                            </Button>
                        </Box>
                    </Box>

                    {/* Modern Select Menus */}
                    <ModernMonthPicker
                        open={Boolean(monthAnchor)}
                        anchorEl={monthAnchor}
                        onClose={() => setMonthAnchor(null)}
                        value={filterMonth}
                        onChange={setFilterMonth}
                        title="Filter by Month"
                    />
                    <ModernYearPicker
                        open={Boolean(yearAnchor)}
                        anchorEl={yearAnchor}
                        onClose={() => setYearAnchor(null)}
                        value={filterYear}
                        onChange={setFilterYear}
                        title="Filter by Year"
                    />
                    <ModernSelectMenu
                        open={Boolean(statusAnchor)}
                        anchorEl={statusAnchor}
                        onClose={() => setStatusAnchor(null)}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={modernStatusOptions}
                        title="Filter by Status"
                    />

                    {/* ─────────────── Cards grid ─────────────── */}
                    <Box sx={{flex: 1, overflowY: "auto", pr: 1}}>
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
                            {filtered.map((proj) => (
                                <ProjectCard
                                    key={proj.id}
                                    proj={proj}
                                    bigTaskStats={btStats[proj.id] ?? emptyStats}
                                    onOpen={() => openProject(proj.id)}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* ─────────────── Mobile Filter Drawer ─────────────── */}
                    <Drawer
                        anchor="bottom"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        PaperProps={{
                            sx: {
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                background: (t) => t.palette.background.default,
                                p: 3,
                            },
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} textAlign="center" mb={2}>
                            Filters
                        </Typography>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search projects…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={filterStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon size={16} style={{color: "#aaa"}}/>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Month - Modern Button */}
                            <Button
                                onClick={e => setMonthAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                fullWidth
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {monthLabel}
                            </Button>

                            {/* Year - Modern Button */}
                            <Button
                                onClick={e => setYearAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                fullWidth
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {yearLabel}
                            </Button>

                            {/* Status - Modern Button */}
                            <Button
                                onClick={e => setStatusAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                fullWidth
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                }}
                            >
                                {statusLabel}
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{mt: 2, background: "#6C63FF"}}
                                onClick={() => setDrawerOpen(false)}
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </Drawer>

                    {/* ─────────────── Create Project Modal ─────────────── */}
                    <CreateProjectModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        onProjectCreated={handleProjectCreated}
                        container={containerRef.current}
                    />
                </>
            )}
        </Box>
    );
}
