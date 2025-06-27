// src/components/DashboardExportModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Box,
    Typography,
    CircularProgress,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';

const paperStyles = {
    width: '90vw',
    maxWidth: '600px',
    maxHeight: '90vh',
    background: 'linear-gradient(135deg, #1e1e2f, #14141e)',
    backdropFilter: 'none',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
};

export default function DashboardExportModal({ open, onClose }) {
    const { enqueueSnackbar } = useSnackbar();
    const [exportType, setExportType] = useState('dashboard');
    const [fileFormat, setFileFormat] = useState('csv');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');

    // ← New state to prevent multiple exports
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (exportType === 'summary') {
            API.project
                .get('/projects/')
                .then((res) => setProjects(res.data))
                .catch(() => setProjects([]));
        }
    }, [exportType]);

    const handleExport = async () => {
        if (exporting) return; // Prevent duplicate clicks
        setExporting(true);

        try {
            // 1) Build params
            const params = new URLSearchParams({
                export_type:
                    exportType === 'dashboard_by_project' ? 'dashboard' : exportType,
                file_format: fileFormat,
            });
            if (exportType === 'dashboard_by_project')
                params.append('by_project', 'true');
            if (exportType === 'summary')
                params.append('project_id', selectedProject);

            // 2) Correct base URL
            const base = import.meta.env.VITE_ANALYTICS_API.replace(/\/$/, '');
            const url = `${base}/analytics/export?${params.toString()}`;

            // 3) Fetch as blob
            const token = await window.getAuth0Token();
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Export failed (${res.status})`);

            const blob = await res.blob();

            // 4) Extract filename
            const cd = res.headers.get('Content-Disposition') || '';
            let filename = `export.${fileFormat}`;
            const m = cd.match(/filename="(.+)"/);
            if (m) filename = m[1];

            // 5) Trigger download
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);

            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar(err.message || 'Export failed', { variant: 'error' });
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: paperStyles }}
            BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
            disablePortal
            disableEnforceFocus
            disableAutoFocus
        >
            <DialogTitle sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                        }}
                    >
                        Export Dashboard Data
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: '#ccc' }} disabled={exporting}>
                        <CloseIcon size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: 3,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 8 },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 4,
                    },
                }}
            >
                <FormControl fullWidth margin="dense">
                    <InputLabel sx={{ color: '#bbb' }}>Export Type</InputLabel>
                    <Select
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value)}
                        sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6C63FF',
                            },
                        }}
                        disabled={exporting}
                    >
                        <MenuItem value="dashboard">Dashboard (total)</MenuItem>
                        <MenuItem value="dashboard_by_project">Dashboard by Project</MenuItem>
                        <MenuItem value="summary">Project Summary</MenuItem>
                    </Select>
                </FormControl>

                {exportType === 'summary' && (
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="project-select-label" sx={{ color: '#bbb' }}>
                            Project
                        </InputLabel>
                        <Select
                            labelId="project-select-label"
                            id="project-select"
                            label="Project"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            sx={{
                                color: '#fff',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#888',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6C63FF',
                                },
                            }}
                            disabled={exporting}
                        >
                            {projects.map((proj) => (
                                <MenuItem key={proj.id} value={proj.id}>
                                    {proj.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <FormControl fullWidth margin="dense">
                    <InputLabel sx={{ color: '#bbb' }}>File Format</InputLabel>
                    <Select
                        value={fileFormat}
                        onChange={(e) => setFileFormat(e.target.value)}
                        sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#888',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6C63FF',
                            },
                        }}
                        disabled={exporting}
                    >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="xlsx">Excel</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button
                    onClick={onClose}
                    sx={{ color: '#ccc', textTransform: 'none' }}
                    disabled={exporting}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={
                        exporting || (exportType === 'summary' && !selectedProject)
                    }
                    sx={{
                        background: 'linear-gradient(135deg, #6C63FF, #43E8D8)',
                        textTransform: 'none',
                        boxShadow: '0 6px 18px rgba(108,99,255,0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5f59f7, #3fd9c6)',
                        },
                    }}
                    startIcon={
                        exporting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null
                    }
                >
                    {exporting ? 'Exporting…' : 'Export'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
