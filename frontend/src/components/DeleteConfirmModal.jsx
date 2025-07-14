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
                        width: { xs: '92%', sm: 420 },
                        maxWidth: 'calc(100vw - 32px)',
                        bgcolor: 'rgba(28, 28, 32, 0.9)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 85, 85, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,85,85,0.15)',
                        borderRadius: 2.5,
                        outline: 'none',
                        p: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
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

                    <Typography variant="h6" sx={{
                        fontWeight: 500,
                        color: '#fff',
                        mb: 1.5,
                        fontSize: '1.1rem',
                        letterSpacing: '0.01em'
                    }}>
                        {title}
                    </Typography>

                    <Typography sx={{
                        color: 'rgba(255,255,255,0.75)',
                        mb: 3,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        fontWeight: 400
                    }}>
                        {subtitle}
                    </Typography>

                    <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.8)',
                        mb: 1.5,
                        fontSize: '0.875rem',
                        fontWeight: 400
                    }}>
                        Type <Typography component="span" sx={{
                            color: '#fff',
                            fontWeight: 500,
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.85rem'
                        }}>{nameToConfirm}</Typography> to confirm.
                    </Typography>

                    <Box sx={{ width: '100%', mb: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Type "${nameToConfirm}"`}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 400,
                                    '&.Mui-focused': {
                                        borderColor: '#FF5555',
                                        boxShadow: '0 0 0 2px rgba(255, 85, 85, 0.15)',
                                    },
                                },
                                '& input': {
                                    textAlign: 'left',
                                    py: 1.5,
                                    fontFamily: 'monospace'
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(255,255,255,0.5)',
                                    opacity: 1
                                }
                            }}
                        />
                    </Box>

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
