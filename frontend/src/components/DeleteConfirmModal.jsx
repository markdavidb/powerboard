// src/components/DeleteConfirmModal.jsx
import React from 'react';
import {
    Dialog,
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
} from '@mui/material';
import { X as CloseIcon, Trash2 as TrashIcon } from 'lucide-react';

export default function DeleteConfirmModal({
                                               open,
                                               onClose,
                                               onDelete,
                                               loading = false,
                                               title = 'Delete task?',
                                               subtitle = 'This action can’t be undone.',
                                           }) {
    const safeOnDelete = async () => {
        try { await onDelete?.(); } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Delete failed:', err);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            sx={{ zIndex: theme => theme.zIndex.modal + 200 }}
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: '55%', left: '53.3%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: 340,
                    px: 4, py: 3,
                    borderRadius: 4,
                    background: 'rgba(34,36,51,0.97)',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 40px 4px rgba(45,41,84,0.32)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                },
            }}
            BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', right: 14, top: 14, color: '#aaa' }}
            >
                <CloseIcon size={22} />
            </IconButton>

            <Box mt={2} mb={1}>
                <TrashIcon size={36} color="#F25757" />
            </Box>

            <Typography
                variant="h6"
                fontWeight={700}
                mb={1}
                color="#fff"
                align="center"
            >
                {title}
            </Typography>

            <Typography color="#aaa" mb={3} fontSize={15} align="center">
                {subtitle}
            </Typography>

            <Box display="flex" gap={2}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={safeOnDelete}
                    startIcon={
                        loading ? (
                            <CircularProgress size={18} sx={{ color: '#fff' }} />
                        ) : (
                            <TrashIcon size={18} />
                        )
                    }
                    disabled={loading}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(90deg,#f85b5b 30%,#fe8383 100%)',
                        boxShadow: '0 2px 12px rgba(255,82,82,0.12)',
                    }}
                >
                    Delete
                </Button>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        borderRadius: 3,
                        borderColor: '#aaa',
                        color: '#aaa',
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.03)',
                    }}
                >
                    Cancel
                </Button>
            </Box>
        </Dialog>
    );
}
