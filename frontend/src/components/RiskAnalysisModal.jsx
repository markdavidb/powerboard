import React, { useState, useEffect } from 'react';
import {
    Modal,
    Fade,
    Box,
    Typography,
    IconButton,
    Divider,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    X as CloseIcon,
    Brain,
    TrendingUp,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    Sparkles,
    Shield,
    RefreshCw,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { API } from '../api/axios';

const RiskAnalysisModal = ({ open, onClose, projectId, projectTitle }) => {
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [riskData, setRiskData] = useState(null);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setRiskData(null);
            setHasAnalyzed(false);
        }
    }, [open]);

    const analyzeRisks = async () => {
        setLoading(true);
        try {
            const response = await API.ai.post('/ai/analyze_risks', {
                project_id: parseInt(projectId, 10),
            });
            setRiskData(response.data);
            setHasAnalyzed(true);
            enqueueSnackbar('Risk analysis completed', { variant: 'success' });
        } catch (err) {
            console.error('Risk analysis error:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Analysis failed';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getSeverityConfig = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
                return {
                    color: '#e53935',
                    icon: <AlertTriangle size={14} />,
                    bgColor: 'rgba(229, 57, 53, 0.1)',
                    borderColor: 'rgba(229, 57, 53, 0.3)',
                };
            case 'medium':
                return {
                    color: '#ffb300',
                    icon: <AlertCircle size={14} />,
                    bgColor: 'rgba(255, 179, 0, 0.1)',
                    borderColor: 'rgba(255, 179, 0, 0.3)',
                };
            case 'low':
                return {
                    color: '#2196f3',
                    icon: <Info size={14} />,
                    bgColor: 'rgba(33, 150, 243, 0.1)',
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                };
            default:
                return {
                    color: '#757575',
                    icon: <Info size={14} />,
                    bgColor: 'rgba(117, 117, 117, 0.1)',
                    borderColor: 'rgba(117, 117, 117, 0.3)',
                };
        }
    };

    const handleClose = () => {
        setRiskData(null);
        setHasAnalyzed(false);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            container={undefined}
            closeAfterTransition
            BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '90%', md: 600 },
                        maxWidth: { xs: '100vw', sm: '500px', md: '600px' },
                        bgcolor: 'rgba(28, 28, 32, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108,99,255,0.1)',
                        borderRadius: 3,
                        outline: 'none',
                        p: 0,
                        maxHeight: { xs: '85vh', md: '90vh' },
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 2, md: 3 },
                        pb: { xs: 1.5, md: 2 },
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(147,115,255,0.04))',
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Brain size={16} color="white" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #6C63FF, #9B73FF)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    AI Risk Analysis
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                }}>
                                    {projectTitle}
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title="Close">
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    color: '#aaa',
                                    p: { xs: 1, md: 1 },
                                    '&:hover': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                <CloseIcon size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Body */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
                        {!hasAnalyzed ? (
                            // Initial State - Compact
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                py: { xs: 3, md: 4 }
                            }}>
                                <Box sx={{
                                    width: { xs: 60, md: 70 },
                                    height: { xs: 60, md: 70 },
                                    borderRadius: '50%',
                                    background: 'rgba(108,99,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    border: '1px solid rgba(108,99,255,0.3)',
                                }}>
                                    <Sparkles size={24} color="#6C63FF" />
                                </Box>

                                <Typography variant="h6" sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                }}>
                                    Analyze Project Risks
                                </Typography>

                                <Typography variant="body2" sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    mb: 3,
                                    maxWidth: 350,
                                    lineHeight: 1.5,
                                    fontSize: { xs: '0.85rem', md: '0.9rem' }
                                }}>
                                    AI will analyze your project to identify potential risks and bottlenecks.
                                </Typography>

                                <Button
                                    variant="contained"
                                    onClick={analyzeRisks}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TrendingUp size={16} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: { xs: 3, md: 4 },
                                        py: { xs: 1, md: 1.25 },
                                        background: 'linear-gradient(135deg, #6C63FF, #887CFF)',
                                        boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 16px rgba(108,99,255,0.4)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(108,99,255,0.3)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {loading ? 'Analyzing...' : 'Start Analysis'}
                                </Button>
                            </Box>
                        ) : (
                            // Results State - Compact
                            riskData && (
                                <Stack spacing={2}>
                                    {/* Summary */}
                                    <Box sx={{
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: 2,
                                        p: { xs: 2, md: 2.5 },
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                            <Shield size={16} color="#6C63FF" />
                                            <Typography variant="subtitle1" sx={{
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: { xs: '0.95rem', md: '1rem' }
                                            }}>
                                                Analysis Summary
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{
                                            color: '#e0e0e0',
                                            lineHeight: 1.5,
                                            mb: 2,
                                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                                        }}>
                                            {riskData.summary}
                                        </Typography>
                                        <Chip
                                            label={`${riskData.total_risks} Risk${riskData.total_risks !== 1 ? 's' : ''} Found`}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(108,99,255,0.2)',
                                                color: '#6C63FF',
                                                fontWeight: 500,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>

                                    {/* Risk Alerts */}
                                    {riskData.risk_alerts && riskData.risk_alerts.length > 0 ? (
                                        <Stack spacing={1.5}>
                                            <Typography variant="subtitle1" sx={{
                                                color: '#fff',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                fontSize: { xs: '0.95rem', md: '1rem' }
                                            }}>
                                                <AlertTriangle size={16} color="#ff6b6b" />
                                                Risk Details
                                            </Typography>

                                            {riskData.risk_alerts.map((alert, index) => {
                                                const config = getSeverityConfig(alert.severity);
                                                return (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            p: { xs: 2, md: 2.5 },
                                                            borderRadius: 2,
                                                            background: config.bgColor,
                                                            border: `1px solid ${config.borderColor}`,
                                                            borderLeft: `3px solid ${config.color}`,
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {config.icon}
                                                                <Typography variant="subtitle2" sx={{
                                                                    color: '#fff',
                                                                    fontWeight: 600,
                                                                    fontSize: { xs: '0.85rem', md: '0.9rem' }
                                                                }}>
                                                                    {alert.risk_type}
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={alert.severity}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: `${config.color}22`,
                                                                    color: config.color,
                                                                    fontWeight: 500,
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        </Box>

                                                        <Typography variant="body2" sx={{
                                                            color: '#e0e0e0',
                                                            lineHeight: 1.5,
                                                            mb: alert.affected_items?.length || alert.recommendations?.length ? 1.5 : 0,
                                                            fontSize: { xs: '0.8rem', md: '0.85rem' }
                                                        }}>
                                                            {alert.description}
                                                        </Typography>

                                                        {alert.affected_items && alert.affected_items.length > 0 && (
                                                            <Box sx={{ mb: 1.5 }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#bbb',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    fontSize: '0.7rem',
                                                                    letterSpacing: '0.5px',
                                                                    mb: 0.5,
                                                                    display: 'block'
                                                                }}>
                                                                    Affected Items
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {alert.affected_items.slice(0, 3).map((item, i) => (
                                                                        <Chip
                                                                            key={i}
                                                                            label={item}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                                                color: '#e0e0e0',
                                                                                fontSize: '0.7rem',
                                                                                height: 20
                                                                            }}
                                                                        />
                                                                    ))}
                                                                    {alert.affected_items.length > 3 && (
                                                                        <Chip
                                                                            label={`+${alert.affected_items.length - 3} more`}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: 'rgba(108,99,255,0.2)',
                                                                                color: '#6C63FF',
                                                                                fontSize: '0.7rem',
                                                                                height: 20
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {alert.recommendations && alert.recommendations.length > 0 && (
                                                            <Box>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#bbb',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    fontSize: '0.7rem',
                                                                    letterSpacing: '0.5px',
                                                                    mb: 0.5,
                                                                    display: 'block'
                                                                }}>
                                                                    Recommendations
                                                                </Typography>
                                                                <Stack spacing={0.5}>
                                                                    {alert.recommendations.slice(0, 2).map((rec, i) => (
                                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                            <Box sx={{
                                                                                width: 4,
                                                                                height: 4,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: '#4caf50',
                                                                                mt: 0.75,
                                                                                flexShrink: 0,
                                                                            }} />
                                                                            <Typography variant="caption" sx={{
                                                                                color: '#e0e0e0',
                                                                                lineHeight: 1.4,
                                                                                fontSize: '0.75rem'
                                                                            }}>
                                                                                {rec}
                                                                            </Typography>
                                                                        </Box>
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    ) : (
                                        // No Risks - Compact
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 3,
                                            px: 2,
                                            borderRadius: 2,
                                            background: 'rgba(76, 175, 80, 0.1)',
                                            border: '1px solid rgba(76, 175, 80, 0.3)',
                                        }}>
                                            <CheckCircle2 size={32} color="#4caf50" style={{ marginBottom: 8 }} />
                                            <Typography variant="h6" sx={{
                                                color: '#fff',
                                                fontWeight: 600,
                                                mb: 0.5,
                                                fontSize: { xs: '1rem', md: '1.1rem' }
                                            }}>
                                                All Clear!
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: { xs: '0.8rem', md: '0.85rem' }
                                            }}>
                                                No significant risks detected.
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            )
                        )}
                    </Box>

                    {/* Footer */}
                    {hasAnalyzed && (
                        <Box sx={{
                            p: { xs: 2, md: 3 },
                            pt: { xs: 1.5, md: 2 },
                            background: 'rgba(255,255,255,0.02)',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2
                        }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshCw size={16} />}
                                onClick={analyzeRisks}
                                disabled={loading}
                                sx={{
                                    color: '#ddd',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                                    '&:hover': {
                                        borderColor: '#6C63FF',
                                        backgroundColor: 'rgba(108,99,255,0.1)'
                                    }
                                }}
                            >
                                {loading ? 'Analyzing...' : 'Refresh'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                sx={{
                                    color: '#ddd',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                                    '&:hover': {
                                        borderColor: '#fff',
                                        backgroundColor: 'rgba(255,255,255,0.05)'
                                    }
                                }}
                            >
                                Close
                            </Button>
                        </Box>
                    )}
                </Box>
            </Fade>
        </Modal>
    );
};

export default RiskAnalysisModal;
