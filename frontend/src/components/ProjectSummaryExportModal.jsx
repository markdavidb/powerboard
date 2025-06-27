// src/components/ProjectSummaryExportModal.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';

const paperStyles = {
    width: '90vw',
    maxWidth: '500px',
    background: 'linear-gradient(135deg, #1e1e2f, #14141e)',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    color: '#fff',
};

export default function ProjectSummaryExportModal({ open, onClose, projectId }) {
    const { enqueueSnackbar } = useSnackbar();
    const [fileFormat, setFileFormat] = useState('csv');

    // ← New state to prevent multiple exports
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (exporting) return; // avoid duplicate clicks
        setExporting(true);

        try {
            const base = import.meta.env.VITE_ANALYTICS_API.replace(/\/$/, '');
            const params = new URLSearchParams({
                export_type: 'summary',
                file_format: fileFormat,
                project_id: projectId,
            });
            const token = await window.getAuth0Token();
            const res = await fetch(`${base}/analytics/export?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`Export failed (${res.status})`);

            const blob = await res.blob();
            const cd = res.headers.get('Content-Disposition') || '';
            const m = cd.match(/filename="(.+)"/);
            const filename = m ? m[1] : `project_${projectId}_summary.${fileFormat}`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

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
            maxWidth="xs"
            PaperProps={{ sx: paperStyles }}
            BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
        >
            <DialogTitle sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                        }}
                    >
                        Export Project Summary
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: '#ccc' }}>
                        <CloseIcon size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2 }}>
                <FormControl fullWidth margin="dense">
                    <InputLabel sx={{ color: '#bbb' }}>File Format</InputLabel>
                    <Select
                        value={fileFormat}
                        onChange={(e) => setFileFormat(e.target.value)}
                        sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' },
                        }}
                    >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="xlsx">Excel</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button onClick={onClose} sx={{ color: '#ccc', textTransform: 'none' }} disabled={exporting}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={exporting}
                    sx={{
                        background: 'linear-gradient(135deg, #6C63FF, #43E8D8)',
                        textTransform: 'none',
                        boxShadow: '0 6px 18px rgba(108,99,255,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #5f59f7, #3fd9c6)' },
                    }}
                    startIcon={exporting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
                >
                    {exporting ? 'Exporting…' : 'Export'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
