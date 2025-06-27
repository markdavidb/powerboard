// src/components/AssignedProjectsCard.jsx
import React, {useEffect, useState, useCallback} from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Divider,
    Button,
    Box,
} from '@mui/material';
import {RefreshCcw} from 'lucide-react';
import {API} from '../api/axios';

export default function AssignedProjectsCard({
                                                 onProjectClick = () => {
                                                 }
                                             }) {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(() => {
        setLoading(true);
        API.project.get('/projects/')
            .then(res => {
                setProjects(res.data);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <Card
            sx={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                width: '100%',
            }}
        >
            <CardHeader
                title="Projects"
                subheader={projects ? `${projects.length} total` : 'Loading…'}
                action={
                    <Button
                        onClick={fetchProjects}
                        size="small"
                        startIcon={<RefreshCcw size={16}/>}
                        disabled={loading}
                        sx={{textTransform: 'none'}}
                    >
                        Refresh
                    </Button>
                }
                sx={{
                    '& .MuiCardHeader-title': {
                        color: '#D1D1D1',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                    },
                    '& .MuiCardHeader-subheader': {
                        color: '#bdbdbd',
                    },
                }}
            />

            <CardContent
                sx={{
                    p: 0,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    overflowX: 'hidden', // ← ADD THIS
                    '&::-webkit-scrollbar': {width: '6px'},
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(108,99,255,0.4)',
                        borderRadius: '8px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(108,99,255,0.6)',
                    },
                }}
            >

                {error && (
                    <Box sx={{p: 2}}>
                        <Typography color="error">Error: {error}</Typography>
                    </Box>
                )}

                {!projects && loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress/>
                    </Box>
                )}

                {projects && !loading && (
                    <List disablePadding>
                        {projects.map((proj, idx) => (
                            <React.Fragment key={proj.id}>
                                <ListItem
                                    onClick={() => onProjectClick(proj.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        px: 2,
                                        py: 1,
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(108,99,255,0.08)',
                                            transform: 'scale(1.01)',
                                            boxShadow: '0 4px 12px rgba(108,99,255,0.2)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <ListItemText
                                        primary={proj.title}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            sx: {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: '#ffffff',
                                                fontWeight: 500,
                                            },
                                        }}
                                    />
                                </ListItem>
                                {idx < projects.length - 1 && (
                                    <Divider component="li" sx={{borderColor: 'rgba(255,255,255,0.04)'}}/>
                                )}
                            </React.Fragment>
                        ))}

                        {projects.length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary="You’re not assigned to any projects."
                                    primaryTypographyProps={{color: '#bdbdbd'}}
                                />
                            </ListItem>
                        )}
                    </List>
                )}

                {projects && loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
                        <CircularProgress size={20}/>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
