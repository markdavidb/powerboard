// src/pages/ProjectsPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Grid,
    IconButton,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { API } from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";

/* ── tiny helpers ───────────────────────────────── */
const filterStyle = {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    minWidth: 150,
    input: { color: "#fff" },
    "& .MuiInputLabel-root": { color: "#aaa" },
    "& .MuiSvgIcon-root":    { color: "#aaa" },
    "& fieldset":            { border: "none" },
};

const emptyStats = Object.freeze({ total: 0, done: 0 });

export default function ProjectsPage() {
    /* data */
    const [projects, setProjects] = useState([]);
    const [btStats,  setBtStats]  = useState({});      // { [projectId]: { total, done } }

    /* loading flags */
    const [loadingProjects, setLoadingProjects] = useState(true);
    const loadingStats = projects.length && Object.keys(btStats).length < projects.length;
    const loading = loadingProjects || loadingStats;

    /* filters */
    const [searchTerm, setSearchTerm]   = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear]   = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    /* misc UI */
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const containerRef = useRef(null);

    /* ── 1) fetch project list ─────────────────────── */
    useEffect(() => {
        API.project
            .get("/projects")
            .then((r) => setProjects(r.data))
            .catch(console.error)
            .finally(() => setLoadingProjects(false));
    }, []);

    /* ── 2) fetch big-tasks for every project once ─── */
    useEffect(() => {
        if (!projects.length) return;

        const controller = new AbortController();
        Promise.all(
            projects.map((p) =>
                API.project.get("/projects/big_tasks/big_tasks/", {
                    params: { project_id: p.id, mine_only: false },
                    signal: controller.signal,
                })
            )
        )
            .then((responses) => {
                const stats = {};
                responses.forEach((r, idx) => {
                    const list  = r.data;
                    stats[projects[idx].id] = {
                        total: list.length,
                        done:  list.filter((bt) => bt.status === "Done").length,
                    };
                });
                setBtStats(stats);
            })
            .catch((err) => {
                if (err.name !== "CanceledError") console.error(err);
            });

        return () => controller.abort();
    }, [projects]);

    /* ── select-list data for filters ─────────────── */
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthOptions = monthNames.map((l,i)=>({ value:String(i+1), label:l }));
    const currentYear  = new Date().getFullYear();
    const yearOptions  = Array.from({ length:11 },(_,i)=>currentYear-5+i);
    const statusOptions = useMemo(
        () => Array.from(new Set(projects.map((p)=>p.status))).filter(Boolean),
        [projects]
    );

    /* ── filtered list ─────────────────────────────── */
    const filtered = useMemo(() => {
        return projects
            .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((p) => {
                if (!filterMonth && !filterYear) return true;
                if (!p.due_date) return false;
                const d = new Date(p.due_date);
                if (filterYear  && d.getFullYear()   !== Number(filterYear))  return false;
                if (filterMonth && d.getMonth()+1    !== Number(filterMonth)) return false;
                return true;
            })
            .filter((p) => (filterStatus ? p.status === filterStatus : true));
    }, [projects, searchTerm, filterMonth, filterYear, filterStatus]);

    /* modal callback */
    const handleProjectCreated = (proj) => {
        setProjects((prev) => [proj, ...prev]);
        setBtStats((prev) => ({ ...prev, [proj.id]: emptyStats }));
        enqueueSnackbar("Project created successfully!", { variant: "success" });
    };

    const openProject = (id) => navigate(`/projects/${id}/summary`);

    /* ── UI ────────────────────────────────────────── */
    return (
        <Box
            id="main-box"
            ref={containerRef}
            sx={{
                display: "flex",
                flexDirection: "column",
                p: { xs: 1, sm: 2, md: 8 },
                mt: { xs: 1, md: 3 },
                mx: "auto",
                height: "88vh",
                width: "100%",
                maxWidth: { xs: "100%", md: "calc(100vw - 240px)", xl: "1600px" },
                backdropFilter: "blur(18px)",
                background: (t) => t.palette.background.default,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                color: "#fff",
            }}
        >
            {/* global spinner while *any* data still loading */}
            {loading && (
                <Box sx={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
                    <CircularProgress sx={{ color:"#6C63FF" }} />
                </Box>
            )}

            {!loading && (
                <>
                    <Typography variant="h4" fontWeight={700} mb={4}
                                sx={{ textShadow:"0 0 10px #6C63FF88" }}>
                        My Projects
                    </Typography>

                    {/* filters */}
                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:2, mb:4 }}>
                        <TextField
                            variant="outlined" size="small" placeholder="Search projects…"
                            value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}
                            sx={filterStyle}
                        />
                        <TextField select label="Month" size="small"
                                   value={filterMonth} onChange={(e)=>setFilterMonth(e.target.value)}
                                   sx={filterStyle}>
                            <MenuItem value="">All</MenuItem>
                            {monthOptions.map((m)=>(
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Year" size="small"
                                   value={filterYear} onChange={(e)=>setFilterYear(e.target.value)}
                                   sx={filterStyle}>
                            <MenuItem value="">All</MenuItem>
                            {yearOptions.map((y)=>(
                                <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Status" size="small"
                                   value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}
                                   sx={filterStyle}>
                            <MenuItem value="">All</MenuItem>
                            {statusOptions.map((s)=>(
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* card grid */}
                    <Box
                        sx={{
                            flex:1, overflowY:"auto", pr:2, p:2,
                            "&::-webkit-scrollbar": { width:8 },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor:"rgba(108,99,255,0.4)",
                                borderRadius:8, border:"2px solid transparent",
                                backgroundClip:"content-box",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                                backgroundColor:"rgba(108,99,255,0.7)",
                            },
                        }}
                    >
                        <Grid container spacing={3}>
                            {filtered.map((proj)=>(
                                <Grid item xs={12} sm={6} md={4} key={proj.id}>
                                    <ProjectCard
                                        proj={proj}
                                        bigTaskStats={btStats[proj.id] ?? emptyStats}
                                        onOpen={()=>openProject(proj.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </>
            )}

            {/* FAB + modal */}
            <Tooltip title="Create Project">
                <IconButton
                    onClick={()=>setModalOpen(true)}
                    sx={{
                        position:"fixed", bottom:40, right:60,
                        background:"linear-gradient(135deg,#6C63FF,#9B78FF)",
                        color:"#fff", p:2,
                        boxShadow:"0 6px 18px rgba(108,99,255,0.5)",
                        "&:hover":{ background:"linear-gradient(135deg,#5a50e0,#8e6cf1)" },
                    }}
                >
                    <Plus/>
                </IconButton>
            </Tooltip>

            <CreateProjectModal
                open={modalOpen}
                onClose={()=>setModalOpen(false)}
                onProjectCreated={handleProjectCreated}
                container={containerRef.current}
            />
        </Box>
    );
}
