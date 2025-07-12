// src/pages/ProjectsPage.jsx

import React, {useEffect, useState, useMemo, useRef} from "react";
import {
    Box, Typography, TextField, MenuItem, IconButton, Tooltip,
    CircularProgress, Button, Drawer, InputAdornment
} from "@mui/material";
import {
    Plus, SlidersHorizontal, Calendar as CalendarIcon,
    Search as SearchIcon
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import {API} from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";

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

        Promise.all(
            projects.map((p) =>
                API.project.get("/projects/big_tasks/big_tasks/", {
                    params: {project_id: p.id, mine_only: false},
                    signal: controller.signal,
                })
            )
        )
            .then((responses) => {
                const stats = {};
                responses.forEach((r, idx) => {
                    const list = r.data;
                    stats[projects[idx].id] = {
                        total: list.length,
                        done: list.filter((bt) => bt.status === "Done").length,
                    };
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
    const yearOptions = Array.from({length: 11}, (_, i) => currentYear - 5 + i);
    const statusOptions = useMemo(() =>
        Array.from(new Set(projects.map(p => p.status))).filter(Boolean), [projects]);

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
                            <TextField select label="Month" size="small" value={filterMonth}
                                       onChange={(e) => setFilterMonth(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {monthOptions.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Year" size="small" value={filterYear}
                                       onChange={(e) => setFilterYear(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Status" size="small" value={filterStatus}
                                       onChange={(e) => setFilterStatus(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {statusOptions.map((s) => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
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
                            <TextField select label="Month" size="small" value={filterMonth}
                                       onChange={(e) => setFilterMonth(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {monthOptions.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Year" size="small" value={filterYear}
                                       onChange={(e) => setFilterYear(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Status" size="small" value={filterStatus}
                                       onChange={(e) => setFilterStatus(e.target.value)} sx={filterStyle}>
                                <MenuItem value="">All</MenuItem>
                                {statusOptions.map((s) => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
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
