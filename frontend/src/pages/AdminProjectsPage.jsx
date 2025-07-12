// src/pages/AdminProjectsPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Grid,
    Button,
    Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/axios';
import { FolderKanban } from 'lucide-react';

/**
 * Admin-only view that lists EVERY project in the system.
 * Calls GET /admin/projects (backend enforces platform_admin role).
 */
export default function AdminProjectsPage() {
    const [projects, setProjects] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.project
            .get('/admin/projects')
            .then((res) => setProjects(res.data))
            .catch((err) => {
                console.error(err);
                setProjects([]); // fallback to empty list
            });
    }, []);

    if (projects === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.5, sm: 2, md: 3, lg: 4 }, // Optimized padding
                mt: { xs: 0.5, sm: 1, md: 2 }, // Reduced top margin
                mx: { xs: 0.5, sm: 1, md: 'auto' }, // Smaller side margins on mobile
                minHeight: { xs: 'calc(100vh - 100px)', md: '90vh' }, // More height usage
                width: { xs: 'calc(100vw - 8px)', sm: 'calc(100vw - 16px)', md: '100%' }, // Use more viewport width
                maxWidth: { xs: '100%', md: 'calc(100vw - 240px)', xl: '1800px' }, // Increased max width
                backdropFilter: 'blur(18px)',
                background: (theme) => theme.palette.background.default,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: { xs: 1, md: 2 }, // Smaller border radius on mobile
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                color: '#fff',
            }}
        >
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 3, color: '#e4e5ed', letterSpacing: 0.5 }}
            >
                Admin Console&nbsp;·&nbsp;All Projects ({projects.length})
            </Typography>

            {projects.length === 0 ? (
                <Typography color="text.secondary">
                    No projects found in the database.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((p) => (
                        <Grid key={p.id} item xs={12} sm={6} md={4}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    background: 'rgba(24,24,30,0.80)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1.5px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 1,
                                            gap: 1,
                                            color: '#7c84ff',
                                        }}
                                    >
                                        <FolderKanban size={18} />
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}
                                            noWrap
                                        >
                                            {p.title}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            height: 44,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {p.description || '— no description —'}
                                    </Typography>

                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontStyle: 'italic' }}
                                        >
                                            Owner: {p.owner.username}
                                        </Typography>

                                        <Tooltip title="Open project summary">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: 13,
                                                    borderColor: '#7c84ff',
                                                    color: '#c8cbff',
                                                    '&:hover': { borderColor: '#9499ff', color: '#fff' },
                                                }}
                                                onClick={() => navigate(`/projects/${p.id}/summary`)}
                                            >
                                                View
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
