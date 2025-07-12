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
import {X as CloseIcon, ChevronDown} from 'lucide-react';
import {useSnackbar} from 'notistack';
import {API} from '../api/axios';
import ModernSelectMenu from './ModernSelectMenu';

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

    // Modern menu anchors
    const [exportTypeAnchor, setExportTypeAnchor] = useState(null);
    const [projectAnchor, setProjectAnchor] = useState(null);
    const [fileFormatAnchor, setFileFormatAnchor] = useState(null);

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

    // Options for modern menus
    const exportTypeOptions = [
        { value: 'dashboard', label: 'Dashboard (total)' },
        { value: 'dashboard_by_project', label: 'Dashboard by Project' },
        { value: 'summary', label: 'Project Summary' },
    ];

    const projectOptions = projects.map(proj => ({
        value: proj.id,
        label: proj.title,
    }));

    const fileFormatOptions = [
        { value: 'csv', label: 'CSV' },
        { value: 'xlsx', label: 'Excel' },
        { value: 'json', label: 'JSON' },
    ];

    const exportTypeLabel = exportTypeOptions.find(opt => opt.value === exportType)?.label || 'Select Export Type';
    const projectLabel = projectOptions.find(opt => opt.value === selectedProject)?.label || 'Select Project';
    const fileFormatLabel = fileFormatOptions.find(opt => opt.value === fileFormat)?.label || 'Select Format';

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
                        {/* Export Type - Modern Button */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#aaa', mb: 1, fontSize: '0.875rem' }}>
                                Export Type
                            </Typography>
                            <Button
                                onClick={e => setExportTypeAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                disabled={exporting}
                                fullWidth
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                    },
                                }}
                            >
                                {exportTypeLabel}
                            </Button>
                        </Box>

                        {/* Project - Modern Button (conditional) */}
                        {exportType === 'summary' && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ color: '#aaa', mb: 1, fontSize: '0.875rem' }}>
                                    Project
                                </Typography>
                                <Button
                                    onClick={e => setProjectAnchor(e.currentTarget)}
                                    variant="outlined"
                                    endIcon={<ChevronDown size={16} />}
                                    disabled={exporting}
                                    fullWidth
                                    sx={{
                                        justifyContent: 'space-between',
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.13)',
                                        textTransform: 'none',
                                        py: 1.5,
                                        '&:hover': {
                                            borderColor: '#9494ff',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                        },
                                    }}
                                >
                                    {projectLabel}
                                </Button>
                            </Box>
                        )}

                        {/* File Format - Modern Button */}
                        <Box>
                            <Typography variant="body2" sx={{ color: '#aaa', mb: 1, fontSize: '0.875rem' }}>
                                File Format
                            </Typography>
                            <Button
                                onClick={e => setFileFormatAnchor(e.currentTarget)}
                                variant="outlined"
                                endIcon={<ChevronDown size={16} />}
                                disabled={exporting}
                                fullWidth
                                sx={{
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.13)',
                                    textTransform: 'none',
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#9494ff',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                    },
                                }}
                            >
                                {fileFormatLabel}
                            </Button>
                        </Box>
                    </Box>

                    {/* Modern Select Menus */}
                    <ModernSelectMenu
                        open={Boolean(exportTypeAnchor)}
                        anchorEl={exportTypeAnchor}
                        onClose={() => setExportTypeAnchor(null)}
                        value={exportType}
                        onChange={setExportType}
                        options={exportTypeOptions}
                        title="Select Export Type"
                    />
                    <ModernSelectMenu
                        open={Boolean(projectAnchor)}
                        anchorEl={projectAnchor}
                        onClose={() => setProjectAnchor(null)}
                        value={selectedProject}
                        onChange={setSelectedProject}
                        options={projectOptions}
                        title="Select Project"
                    />
                    <ModernSelectMenu
                        open={Boolean(fileFormatAnchor)}
                        anchorEl={fileFormatAnchor}
                        onClose={() => setFileFormatAnchor(null)}
                        value={fileFormat}
                        onChange={setFileFormat}
                        options={fileFormatOptions}
                        title="Select File Format"
                    />
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
