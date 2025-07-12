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
    Alert,
    CircularProgress,
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

const RiskAnalysisModal = ({ open, onClose, projectId, projectTitle, container }) => {
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
                    color: 'error',
                    icon: <AlertTriangle size={16} />,
                    bgColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: 'rgba(244, 67, 54, 0.3)',
                };
            case 'medium':
                return {
                    color: 'warning',
                    icon: <AlertCircle size={16} />,
                    bgColor: 'rgba(255, 152, 0, 0.1)',
                    borderColor: 'rgba(255, 152, 0, 0.3)',
                };
            case 'low':
                return {
                    color: 'info',
                    icon: <Info size={16} />,
                    bgColor: 'rgba(33, 150, 243, 0.1)',
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                };
            default:
                return {
                    color: 'default',
                    icon: <Info size={16} />,
                    bgColor: 'rgba(158, 158, 158, 0.1)',
                    borderColor: 'rgba(158, 158, 158, 0.3)',
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
            container={container}
            closeAfterTransition
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                }
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '90%', md: 700, lg: 800 },
                        maxHeight: '90vh',
                        bgcolor: 'rgba(24,24,30,0.95)',
                        backdropFilter: 'blur(24px)',
                        border: '1.5px solid rgba(108,99,255,0.4)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        borderRadius: 3,
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(75,85,99,0.1) 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #6c63ff 0%, #5a52d5 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Brain size={20} color="white" />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        AI Risk Analysis
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {projectTitle}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    '&:hover': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                <CloseIcon size={20} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {!hasAnalyzed ? (
                            // Initial State
                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(75,85,99,0.2) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                        border: '2px solid rgba(108,99,255,0.3)',
                                    }}
                                >
                                    <Sparkles size={32} color="#6c63ff" />
                                </Box>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    Discover Project Risks
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        mb: 4,
                                        maxWidth: 400,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Our AI will analyze your project data to identify potential risks, bottlenecks, and areas that need attention.
                                </Typography>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={analyzeRisks}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp size={20} />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #6c63ff 0%, #5a52d5 100%)',
                                        color: '#fff',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        boxShadow: '0 8px 25px rgba(108,99,255,0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a52d5 0%, #4c46b8 100%)',
                                            boxShadow: '0 12px 35px rgba(108,99,255,0.4)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(108,99,255,0.5)',
                                        },
                                    }}
                                >
                                    {loading ? 'Analyzing...' : 'Start Analysis'}
                                </Button>
                            </Box>
                        ) : (
                            // Results State
                            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                                {riskData && (
                                    <Stack spacing={3}>
                                        {/* Summary Section */}
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(108,99,255,0.1)',
                                                border: '1px solid rgba(108,99,255,0.2)',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Shield size={20} color="#6c63ff" />
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Analysis Summary
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'rgba(255,255,255,0.9)',
                                                    lineHeight: 1.6,
                                                    mb: 2,
                                                }}
                                            >
                                                {riskData.summary}
                                            </Typography>
                                            <Chip
                                                label={`${riskData.total_risks} Risk${riskData.total_risks !== 1 ? 's' : ''} Identified`}
                                                sx={{
                                                    backgroundColor: 'rgba(108,99,255,0.2)',
                                                    color: '#6c63ff',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>

                                        {/* Risk Alerts */}
                                        {riskData.risk_alerts && riskData.risk_alerts.length > 0 ? (
                                            <Stack spacing={2}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <AlertTriangle size={20} color="#ff6b6b" />
                                                    Risk Assessment
                                                </Typography>

                                                {riskData.risk_alerts.map((alert, index) => {
                                                    const config = getSeverityConfig(alert.severity);
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                p: 3,
                                                                borderRadius: 2,
                                                                background: config.bgColor,
                                                                border: `1px solid ${config.borderColor}`,
                                                                borderLeft: `4px solid ${config.borderColor}`,
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                    {config.icon}
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: '#fff',
                                                                            fontWeight: 600,
                                                                            fontSize: '1.1rem',
                                                                        }}
                                                                    >
                                                                        {alert.risk_type}
                                                                    </Typography>
                                                                </Box>
                                                                <Chip
                                                                    label={alert.severity}
                                                                    color={config.color}
                                                                    size="small"
                                                                    sx={{ fontWeight: 600 }}
                                                                />
                                                            </Box>

                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    color: 'rgba(255,255,255,0.9)',
                                                                    mb: 2,
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                {alert.description}
                                                            </Typography>

                                                            {alert.affected_items && alert.affected_items.length > 0 && (
                                                                <Box sx={{ mb: 2 }}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        sx={{
                                                                            color: 'rgba(255,255,255,0.8)',
                                                                            mb: 1,
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        Affected Items:
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                        {alert.affected_items.map((item, i) => (
                                                                            <Chip
                                                                                key={i}
                                                                                label={item}
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                                                    color: 'rgba(255,255,255,0.9)',
                                                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {alert.recommendations && alert.recommendations.length > 0 && (
                                                                <Box>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        sx={{
                                                                            color: 'rgba(255,255,255,0.8)',
                                                                            mb: 1,
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        Recommendations:
                                                                    </Typography>
                                                                    <Stack spacing={1}>
                                                                        {alert.recommendations.map((rec, i) => (
                                                                            <Box
                                                                                key={i}
                                                                                sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'flex-start',
                                                                                    gap: 1.5,
                                                                                }}
                                                                            >
                                                                                <Box
                                                                                    sx={{
                                                                                        width: 6,
                                                                                        height: 6,
                                                                                        borderRadius: '50%',
                                                                                        backgroundColor: '#4caf50',
                                                                                        mt: 1,
                                                                                        flexShrink: 0,
                                                                                    }}
                                                                                />
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{
                                                                                        color: 'rgba(255,255,255,0.9)',
                                                                                        lineHeight: 1.5,
                                                                                    }}
                                                                                >
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
                                            // No Risks Found
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    p: 4,
                                                    borderRadius: 2,
                                                    background: 'rgba(76, 175, 80, 0.1)',
                                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                                }}
                                            >
                                                <CheckCircle2 size={48} color="#4caf50" style={{ marginBottom: 16 }} />
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        mb: 1,
                                                    }}
                                                >
                                                    All Clear!
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.7)',
                                                    }}
                                                >
                                                    No significant risks detected. Your project appears to be on track.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Footer */}
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            {hasAnalyzed && (
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshCw size={16} />}
                                    onClick={analyzeRisks}
                                    disabled={loading}
                                    sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        '&:hover': {
                                            color: '#fff',
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                        },
                                    }}
                                >
                                    {loading ? 'Analyzing...' : 'Refresh Analysis'}
                                </Button>
                            )}
                        </Box>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                borderColor: 'rgba(255,255,255,0.3)',
                                '&:hover': {
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default RiskAnalysisModal;
