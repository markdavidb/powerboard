// src/components/DeleteConfirmModal.jsx
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    TextField,
} from '@mui/material';
import { X as CloseIcon, Trash2 as TrashIcon, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
                                               open,
                                               onClose,
                                               onDelete,
                                               loading = false,
                                               title = 'Delete task?',
                                               subtitle = 'This action can’t be undone.',
                                               project,
                                               itemName, // New prop for the name to confirm
                                           }) {
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (open) {
            setConfirmText('');
        }
    }, [open]);

    const safeOnDelete = async () => {
        try { await onDelete?.(); } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Get the name to confirm - either project title or itemName
    const nameToConfirm = project?.title || itemName || 'delete';
    const canProceed = confirmText === nameToConfirm;

    return (
        <Modal
            open={open}
            onClose={onClose}
            container={undefined}
            closeAfterTransition
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                    },
                },
            }}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 200 }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 340 },
                        maxWidth: 'calc(100vw - 32px)',
                        bgcolor: 'rgba(28, 28, 32, 0.9)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 85, 85, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,85,85,0.15)',
                        borderRadius: 2.5,
                        outline: 'none',
                        p: { xs: 2, sm: 2.5 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#aaa',
                            p: 0.5,
                            '&:hover': {
                                color: '#fff',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <CloseIcon size={16} />
                    </IconButton>

                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255, 85, 85, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                        border: '1px solid rgba(255, 85, 85, 0.2)',
                    }}>
                        <TrashIcon size={18} color="#FF5555" />
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2.5,
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                    }}>
                        {subtitle}
                    </Typography>

                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="body2" sx={{
                            color: '#FFC107',
                            mb: 1,
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 500
                        }}>
                            Type "{nameToConfirm}" to confirm
                        </Typography>
                        <TextField
                            fullWidth
                            autoFocus
                            size="small"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={nameToConfirm}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    '&.Mui-focused': {
                                        borderColor: '#FF5555',
                                        boxShadow: '0 0 0 2px rgba(255, 85, 85, 0.2)',
                                    },
                                },
                                '& input': { textAlign: 'center', py: 1 },
                            }}
                        />
                    </Box>

                    <Typography variant="caption" sx={{
                        color: 'rgba(255, 193, 7, 0.8)',
                        mb: 2,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <AlertTriangle size={14} color="#FFC107" />
                        All data will be permanently removed
                    </Typography>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1.5,
                        width: '100%'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            disabled={loading}
                            sx={{
                                color: '#ddd',
                                borderColor: 'rgba(255,255,255,0.3)',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: 1.5,
                                py: 1,
                                fontSize: '0.875rem',
                                '&:hover': {
                                    borderColor: '#fff',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={safeOnDelete}
                            startIcon={
                                loading ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    <TrashIcon size={14} />
                                )
                            }
                            disabled={loading || !canProceed}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 1.5,
                                py: 1,
                                fontSize: '0.875rem',
                                background: 'linear-gradient(135deg, #E53935, #C62828)',
                                boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 16px rgba(229, 57, 53, 0.4)',
                                },
                                '&:disabled': {
                                    background: 'rgba(229, 57, 53, 0.3)',
                                    color: 'rgba(255,255,255,0.5)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
