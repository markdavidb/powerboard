// src/pages/ProjectSummary.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { API } from '../api/axios';

import {
    Box,
    Grid,
    CircularProgress,
    Typography,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Users, Settings, Download } from 'lucide-react';

import MetricsCard from '../components/MetricsCard';
import ChartBar    from '../components/charts/ChartBar';
import ChartArea   from '../components/charts/ChartArea';

import ProjectMembersModal      from '../components/ProjectMembersModal';
import ProjectSettingsModal     from '../components/ProjectSettingsModal';
import ProjectSummaryExportModal from '../components/ProjectSummaryExportModal';

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

export default function ProjectSummary() {
    const { projectId } = useParams();
    const { user, isAuthenticated } = useAuth0();

    /* ─────────── state ─────────── */
    const [summary, setSummary]   = useState(null);
    const [monthly, setMonthly]   = useState([]);
    const [loading, setLoading]   = useState(true);

    const [exportOpen,  setExportOpen]  = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [settingsOpen,setSettingsOpen]= useState(false);

    const [userRole, setUserRole] = useState(null);

    /* ─────────── data fetch ─────────── */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sumRes, monRes] = await Promise.all([
                API.analytics.get(`/analytics/projects/${projectId}/summary`),
                API.analytics.get(
                    `/analytics/projects/${projectId}/tasks/monthly`,
                    { params:{ months:6 } }
                ),
            ]);
            setSummary(sumRes.data);
            setMonthly(monRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { loadAll(); }, [loadAll]);

    /* role (for settings button) */
    useEffect(() => {
        if (!isAuthenticated) return;
        API.project
            .get(`/projects/members/${projectId}/members`)
            .then(res => {
                const current = user?.nickname || user?.name || user?.email;
                const me = res.data.find(m => m.username === current);
                setUserRole(me?.role);
            })
            .catch(console.error);
    }, [projectId, user, isAuthenticated]);

    /* ─────────── loading UI ─────────── */
    if (loading) {
        return (
            <Box sx={{
                width:'100%',
                minHeight:'88vh',
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}>
                <CircularProgress sx={{ color:'#6C63FF' }}/>
            </Box>
        );
    }

    if (!summary) return null;          // safety

    /* ─────────── derived data ─────────── */
    const metrics = [
        { title:'Tasks',     total:summary.total_tasks,     done:summary.done_tasks     },
        { title:'Big Tasks', total:summary.total_big_tasks, done:summary.done_big_tasks },
        { title:'Overdue',   total:summary.overdue_tasks,   done:0                      },
    ];

    const monthlyTasks = monthly.map(m => ({
        month:  m.month,
        open:   m.created,
        closed: m.completed,
    }));

    const start = monthlyTasks[0]?.month.split('-') || ['','01'];
    const end   = monthlyTasks[monthlyTasks.length-1]?.month.split('-') || ['','01'];
    const barSubtitle =
        `${monthNames[+start[1]-1]} – ${monthNames[+end[1]-1]} ${end[0]}`;

    /* ─────────── JSX ─────────── */
    return (
        <Box sx={{ width: '100%' }}>
            <Box
                id="main-box"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: { xs: 2, sm: 3, md: 4, lg: 6 },
                    mt: { xs: 1, sm: 2, md: 3 },
                    mx: { xs: 1, sm: 2, md: "auto" },
                    minHeight: { xs: "calc(100vh - 180px)", md: "87vh" },
                    width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)", md: "100%" },
                    maxWidth: { xs: "100%", md: "calc(100vw - 240px)", xl: "1600px" },
                    backdropFilter: "blur(18px)",
                    background: (theme) => theme.palette.background.default,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: { xs: 2, md: 3 },
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                    color: "#fff",
                }}
            >
                {/* TEMPORARY TEST - Just a simple title and colored box */}
                <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
                    TEST: {summary.project_title}
                </Typography>

                <Box sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                }}>
                    <Typography variant="h6" color="white">
                        RED BOX - Should fill width
                    </Typography>
                </Box>

                <Box sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'blue',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h6" color="white">
                        BLUE BOX - Should fill width
                    </Typography>
                </Box>
            </Box>

            {/* Keep modals for functionality */}
            <ProjectMembersModal
                open={membersOpen}
                onClose={()=>setMembersOpen(false)}
                projectId={projectId}
            />
            <ProjectSettingsModal
                open={settingsOpen}
                onClose={()=>setSettingsOpen(false)}
                projectId={projectId}
                onProjectUpdated={loadAll}
            />
            <ProjectSummaryExportModal
                open={exportOpen}
                onClose={()=>setExportOpen(false)}
                projectId={projectId}
            />
        </Box>
    );
}
