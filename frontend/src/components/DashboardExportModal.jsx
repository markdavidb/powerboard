import React, {useState, useEffect} from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Divider,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import {X as CloseIcon} from 'lucide-react';
import {useSnackbar} from 'notistack';
import {API} from '../api/axios';

const paperSx = {
    bgcolor: 'rgba(30,32,40,0.94)',
    borderRadius: 3,
    border: '1.5px solid rgba(108,99,255,0.6)',
    boxShadow: '0 6px 48px 0 rgba(20,20,30,0.28)',
    p: 0,
    minWidth: {xs: 320, sm: 420},
    width: '96vw',
    maxWidth: 460,
    outline: 'none',
};

export default function DashboardExportModal({open, onClose}) {
    const {enqueueSnackbar} = useSnackbar();
    const [exportType, setExportType] = useState('dashboard');
    const [fileFormat, setFileFormat] = useState('csv');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (exportType === 'summary') {
            API.project
                .get('/projects/')
                .then(res => setProjects(res.data))
                .catch(() => setProjects([]));
        }
    }, [exportType]);

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const params = new URLSearchParams({
                export_type: exportType === 'dashboard_by_project' ? 'dashboard' : exportType,
                file_format: fileFormat,
            });
            if (exportType === 'dashboard_by_project') {
                params.append('by_project', 'true');
            }
            if (exportType === 'summary') {
                params.append('project_id', selectedProject);
            }
            const base = import.meta.env.VITE_ANALYTICS_API.replace(/\/$/, '');
            const url = `${base}/analytics/export?${params.toString()}`;
            const token = await window.getAuth0Token();
            const res = await fetch(url, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error(`Export failed (${res.status})`);
            const blob = await res.blob();
            const cd = res.headers.get('Content-Disposition') || '';
            const m = cd.match(/filename="(.+)"/);
            const filename = m ? m[1] : `export.${fileFormat}`;
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
            enqueueSnackbar(err.message || 'Export failed', {variant: 'error'});
        } finally {
            setExporting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition>
            <Fade in={open}>
                <Box sx={{
                    ...paperSx,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                }}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2.6,
                        pb: 2,
                    }}>
                        <Typography fontWeight={600} fontSize={20}>
                            Export Dashboard Data
                        </Typography>
                        <IconButton onClick={onClose} size="small" sx={{color: '#b7b7c8'}} disabled={exporting}>
                            <CloseIcon size={21}/>
                        </IconButton>
                    </Box>
                    <Divider sx={{mb: 1, borderColor: 'rgba(120,120,140,0.10)'}}/>
                    {/* Content */}
                    <Box sx={{px: 3, pb: 1}}>
                        <FormControl fullWidth margin="dense" sx={{mb: 2}}>
                            <InputLabel sx={{color: '#aaa'}}>Export Type</InputLabel>
                            <Select
                                value={exportType}
                                onChange={e => setExportType(e.target.value)}
                                label="Export Type"
                                size="small"
                                sx={{
                                    color: '#fff',
                                    '.MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(255,255,255,0.13)'},
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#9494ff'},
                                }}
                                disabled={exporting}
                            >
                                <MenuItem value="dashboard">Dashboard (total)</MenuItem>
                                <MenuItem value="dashboard_by_project">Dashboard by Project</MenuItem>
                                <MenuItem value="summary">Project Summary</MenuItem>
                            </Select>
                        </FormControl>

                        {exportType === 'summary' && (
                            <FormControl fullWidth margin="dense" sx={{mb: 2}}>
                                <InputLabel sx={{color: '#aaa'}}>Project</InputLabel>
                                <Select
                                    value={selectedProject}
                                    onChange={e => setSelectedProject(e.target.value)}
                                    label="Project"
                                    size="small"
                                    sx={{
                                        color: '#fff',
                                        '.MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(255,255,255,0.13)'},
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#9494ff'},
                                    }}
                                    disabled={exporting}
                                >
                                    {projects.map(proj => (
                                        <MenuItem key={proj.id} value={proj.id}>
                                            {proj.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth margin="dense">
                            <InputLabel sx={{color: '#aaa'}}>File Format</InputLabel>
                            <Select
                                value={fileFormat}
                                onChange={e => setFileFormat(e.target.value)}
                                label="File Format"
                                size="small"
                                sx={{
                                    color: '#fff',
                                    '.MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(255,255,255,0.13)'},
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#9494ff'},
                                }}
                                disabled={exporting}
                            >
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="xlsx">Excel</MenuItem>
                                <MenuItem value="json">JSON</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    {/* Actions */}
                    <Divider sx={{mt: 3, borderColor: 'rgba(120,120,140,0.10)'}}/>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2}}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            color="inherit"
                            disabled={exporting}
                            sx={{
                                borderColor: 'rgba(130,130,250,0.14)',
                                color: '#bfc3d4',
                                px: 2.5,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {borderColor: '#6C63FF', background: 'rgba(130,130,250,0.07)'},
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleExport}
                            disabled={exporting || (exportType === 'summary' && !selectedProject)}
                            startIcon={exporting ? <CircularProgress size={16} sx={{color: '#fff'}}/> : null}
                            sx={{
                                background: 'linear-gradient(90deg,#6C63FF 10%,#5a69f8 90%)',
                                color: '#fff',
                                boxShadow: '0 1px 16px 0 rgba(120,110,255,0.11)',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {background: 'linear-gradient(90deg,#7d77fc 0%,#6474fb 100%)'},
                            }}
                        >
                            {exporting ? 'Exporting…' : 'Export'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
