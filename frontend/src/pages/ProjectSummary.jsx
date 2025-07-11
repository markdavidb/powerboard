// src/pages/ProjectSummary.jsx
import React, {useEffect, useState, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import {API} from '../api/axios';

import {
    Box,
    Grid,
    CircularProgress,
    Typography,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import {Users, Settings, Download} from 'lucide-react';

import MetricsCard from '../components/MetricsCard';
import ChartBar from '../components/charts/ChartBar';
import ChartArea from '../components/charts/ChartArea';

import ProjectMembersModal from '../components/ProjectMembersModal';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import ProjectSummaryExportModal from '../components/ProjectSummaryExportModal';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ProjectSummary() {
    const {projectId} = useParams();
    const {user, isAuthenticated} = useAuth0();

    /* ─────────── state ─────────── */
    const [summary, setSummary] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);

    const [exportOpen, setExportOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const [userRole, setUserRole] = useState(null);

    /* ─────────── data fetch ─────────── */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sumRes, monRes] = await Promise.all([
                API.analytics.get(`/analytics/projects/${projectId}/summary`),
                API.analytics.get(
                    `/analytics/projects/${projectId}/tasks/monthly`,
                    {params: {months: 6}}
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

    useEffect(() => {
        loadAll();
    }, [loadAll]);

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

    if (!summary) return null;          // safety

    /* ─────────── derived data ─────────── */
    const metrics = [
        {title: 'Tasks', total: summary.total_tasks, done: summary.done_tasks},
        {title: 'Big Tasks', total: summary.total_big_tasks, done: summary.done_big_tasks},
        {title: 'Overdue', total: summary.overdue_tasks, done: 0},
    ];

    const monthlyTasks = monthly.map(m => ({
        month: m.month,
        open: m.created,
        closed: m.completed,
    }));

    const start = monthlyTasks[0]?.month.split('-') || ['', '01'];
    const end = monthlyTasks[monthlyTasks.length - 1]?.month.split('-') || ['', '01'];
    const barSubtitle =
        `${monthNames[+start[1] - 1]} – ${monthNames[+end[1] - 1]} ${end[0]}`;

    /* ─────────── JSX ─────────── */
    return (
        <Box sx={{
            width: '100%',
            maxWidth: {xs: '100%', md: 'calc(100vw - 240px)', xl: '1600px'},
            mx: 'auto',
            mt: {xs: 1, md: 0},
            p: {xs: 1, sm: 2, md: 4},
            // let it grow to fit all content, but never shorter than full viewport minus header/nav
            minHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
            boxSizing: 'border-box',
            backdropFilter: 'blur(18px)',
            background: theme => theme.palette.background.default,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
        }}>


            {/* ─── header row ─────────────────────────────────────────────── */}
            <Box sx={{
                mb: { xs: 3, sm: 4, md: 5 },
            }}>
                {/* Title */}
                <Typography
                    variant={{ xs: 'h5', sm: 'h4', md: 'h3' }}
                    sx={{
                        fontWeight: { xs: 700, sm: 800 },
                        fontSize: { xs: '20px', sm: '28px', md: '32px' },
                        mb: { xs: 3, sm: 4 }, // more space below title
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}
                >
                    {summary.project_title}
                </Typography>

                {/* Action buttons */}
                <Box sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 1.5 }, // smaller gap between buttons
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start'
                }}>
                    <Button
                        onClick={() => setMembersOpen(true)}
                        startIcon={<Users size={14}/>} // smaller icon
                        sx={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            borderRadius: 1.5, // smaller border radius
                            textTransform: 'none',
                            fontWeight: 500, // lighter font weight
                            fontSize: '13px', // smaller text
                            px: 1.5, // smaller horizontal padding
                            py: 0.75, // smaller vertical padding
                            mt:2,
                            minHeight: 35, // smaller button height
                            '&:hover': {background: 'rgba(255,255,255,0.16)'}
                        }}
                    >
                        Members
                    </Button>

                    {userRole === 'owner' && (
                        <Button
                            onClick={() => setSettingsOpen(true)}
                            startIcon={<Settings size={14}/>} // smaller icon
                            sx={{
                                background: 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                borderRadius: 1.5, // smaller border radius
                                textTransform: 'none',
                                fontWeight: 500, // lighter font weight
                                fontSize: '13px', // smaller text
                                px: 1.5, // smaller horizontal padding
                                py: 0.75, // smaller vertical padding
                                                            mt:2,
                                minHeight: 32, // smaller button height
                                '&:hover': {background: 'rgba(255,255,255,0.16)'}
                            }}
                        >
                            Settings
                        </Button>
                    )}
                </Box>
            </Box>

            {/* ─── metrics ───────────────────────────────────────────────── */}
            <Grid container spacing={3} sx={{mb: 5}} justifyContent="center">
                {metrics.map(m => (
                    <Grid key={m.title} item xs={12} md={4} sx={{display: 'flex'}}>
                        <MetricsCard title={m.title} total={m.total} done={m.done}/>
                    </Grid>
                ))}
            </Grid>

            {/* ─── charts row ────────────────────────────────────────────── */}
            <Box sx={{
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'},
                gap: 3,
                width: '100%',
            }}>
                {/* Bar chart (fixed width) */}
                <Box sx={{flexShrink: 0, width: {xs: '100%', md: 320}}}>
                    <ChartBar
                        data={monthlyTasks}
                        title="Open vs Closed Tasks"
                        subtitle={barSubtitle}
                    />
                </Box>

                {/* Area chart (fills remaining space) */}
                <Box sx={{flexGrow: 1}}>
                    <ChartArea
                        data={monthlyTasks}
                        title="Open vs Closed Tasks"
                        subtitle="Last 6 months"
                    />
                </Box>
            </Box>

            {/* ─── export button under charts ─────────────────────────────── */}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                <Tooltip title="Export Project Summary">
                    <IconButton
                        onClick={() => setExportOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg,#1F8EF1,#5C9EFF)',
                            color: '#fff',
                            p: 2,
                            '&:hover': {
                                background: 'linear-gradient(135deg,#167ac6,#3b8eff)'
                            }
                        }}
                    >
                        <Download/>
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ─── modals ────────────────────────────────────────────────── */}
            <ProjectMembersModal
                open={membersOpen}
                onClose={() => setMembersOpen(false)}
                projectId={projectId}
            />
            <ProjectSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                projectId={projectId}
                onProjectUpdated={loadAll}
            />
            <ProjectSummaryExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                projectId={projectId}
            />


        </Box>
    );
}