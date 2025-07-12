import React, { useEffect, useState } from 'react';
import { API } from '../api/axios';
import {
    Box,
    Grid,
    CircularProgress,
    IconButton,
    Tooltip,
    useTheme,
} from '@mui/material';
import { Download } from 'lucide-react';
import DashboardExportModal from '../components/DashboardExportModal';
import MetricsCard from '../components/MetricsCard';
import ChartBar from '../components/charts/ChartBar';
import ChartArea from '../components/charts/ChartArea';

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

export default function Dashboard() {
    const theme = useTheme();
    const [summary,    setSummary]    = useState(null);
    const [monthly,    setMonthly]    = useState([]);
    const [cumulative, setCumulative] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [exportOpen, setExportOpen] = useState(false);

    useEffect(() => {
        async function loadAll() {
            setLoading(true);
            try {
                const [sumRes, monRes, cumRes] = await Promise.all([
                    API.analytics.get('analytics/dashboard/summary'),
                    API.analytics.get('analytics/dashboard/tasks/monthly',   { params: { months: 6 } }),
                    API.analytics.get('analytics/dashboard/projects/cumulative', { params: { months: 6 } }),
                ]);
                setSummary(sumRes.data);
                setMonthly(monRes.data);
                setCumulative(cumRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadAll();
    }, []);

    if (loading) {
        return (
            <Box sx={{
                width: '100%',
                minHeight: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <CircularProgress sx={{ color: '#6C63FF' }} />
            </Box>
        );
    }

    const metrics = summary ? [
        { title: 'Projects',   total: summary.total_projects,   done: summary.done_projects   },
        { title: 'Big Tasks',  total: summary.total_big_tasks,  done: summary.done_big_tasks  },
        { title: 'Tasks',      total: summary.total_tasks,      done: summary.done_tasks      },
    ] : [];

    const monthlyTasks = monthly.map(m => ({
        month:  m.month,
        open:   m.created,
        closed: m.completed,
    }));

    const start = monthlyTasks[0]?.month.split('-') || ['', '01'];
    const end   = monthlyTasks[monthlyTasks.length - 1]?.month.split('-') || ['', '01'];
    const barSubtitle =
        `${monthNames[+start[1] - 1]} – ${monthNames[+end[1] - 1]} ${end[0]}`;

    return (
        <Box
            id="main-box"
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
                background: theme.palette.background.default,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: { xs: 1, md: 2 }, // Added missing borderRadius
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                color: "#fff",
            }}
        >
            {/* Metrics */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 5 }} justifyContent="center">
                {metrics.map(m => (
                    <Grid key={m.title} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                        <MetricsCard title={m.title} total={m.total} done={m.done} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts row */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    width: '100%',
                    minHeight: { xs: 'auto', md: 450 }
                }}
            >
                {/* Bar chart */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '32%' },
                        minHeight: { xs: 300, md: 'auto' },
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <ChartBar
                        data={monthlyTasks}
                        title="Open vs Closed Tasks"
                        subtitle={barSubtitle}
                    />
                </Box>

                {/* Area chart */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: { xs: 300, md: 'auto' },
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <ChartArea
                        data={cumulative}
                        title="Open vs Closed Projects"
                        subtitle="Last 6 months"
                    />
                </Box>
            </Box>

            {/* Export button under charts */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Tooltip title="Export Dashboard Data">
                    <IconButton
                        onClick={() => setExportOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg,#1F8EF1,#5C9EFF)',
                            color: '#fff',
                            p: 2,
                            '&:hover': { background: 'linear-gradient(135deg,#167ac6,#3b8eff)' },
                        }}
                    >
                        <Download />
                    </IconButton>
                </Tooltip>
            </Box>

            <DashboardExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
            />
        </Box>
    );
}
