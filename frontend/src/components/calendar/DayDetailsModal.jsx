// src/components/calendar/DayDetailsModal.jsx
import React, {useState, useRef} from 'react';
import {
    Modal, Box, List, ListItem, Fade,
    Typography, IconButton, Chip
} from '@mui/material';
import {X, Calendar, Briefcase, Flag, ClipboardList} from 'lucide-react';
import {format} from 'date-fns';
import BigTaskDetailsModal from '../../components/BigTaskDetailsModal';
import TaskDetailsModal from '../../components/TaskDetailsModal';
import {useNavigate} from 'react-router-dom';

const TYPE_CONFIG = {
    project: {
        icon: <Briefcase size={16} />,
        color: '#ff007f',
        bg: 'rgba(255,0,127,0.15)',
        label: 'PROJECT'
    },
    epic: {
        icon: <Flag size={16} />,
        color: '#f7b32b',
        bg: 'rgba(247,179,43,0.15)',
        label: 'EPIC'
    },
    task: {
        icon: <ClipboardList size={16} />,
        color: '#1e90ff',
        bg: 'rgba(30,144,255,0.15)',
        label: 'TASK'
    },
};

export default function DayDetailsModal({open, date, items, onClose, onItemUpdated, container}) {
    const [selEpic, setSelEpic] = useState(null);
    const [epicOpen, setEpicOpen] = useState(false);
    const [selTask, setSelTask] = useState(null);
    const [taskOpen, setTaskOpen] = useState(false);
    const modalRef = useRef(null);
    const navigate = useNavigate();

    const handleClick = item => {
        switch (item.type) {
            case 'project':
                onClose();
                navigate(`/projects/${item.id}/summary`);
                break;
            case 'epic':
                setSelEpic(item);
                setEpicOpen(true);
                break;
            case 'task':
                setSelTask(item);
                setTaskOpen(true);
                break;
            default:
                break;
        }
    };

    const closeEpic = () => {
        setEpicOpen(false);
        setSelEpic(null);
    };

    const closeTask = () => {
        setTaskOpen(false);
        if (selTask) {
            onItemUpdated();
            setSelTask(null);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                container={container}
                closeAfterTransition
                BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0)' } }}
            >
                <Fade in={open}>
                    <Box
                        ref={modalRef}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '95%', sm: '90%', md: 500 },
                            maxWidth: { xs: '100vw', sm: '500px', md: '500px' },
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
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: 'rgba(108,99,255,0.15)',
                                    border: '1px solid rgba(108,99,255,0.3)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Calendar size={16} style={{ color: '#6C63FF' }} />
                                </Box>
                                <Typography sx={{
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #6C63FF, #9B73FF)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    {date ? format(date, 'EEEE, MMMM d') : ''}
                                </Typography>
                            </Box>

                            <IconButton
                                onClick={onClose}
                                sx={{
                                    color: '#aaa',
                                    p: { xs: 1, md: 1 },
                                    '&:hover': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                <X size={18} />
                            </IconButton>
                        </Box>

                        {/* Content */}
                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: { xs: 2, md: 3 },
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(108,99,255,0.4)',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: 'rgba(108,99,255,0.6)',
                            },
                        }}>
                            {items.length === 0 ? (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 2,
                                    border: '1px dashed rgba(255,255,255,0.1)'
                                }}>
                                    <Calendar size={32} style={{
                                        color: 'rgba(255,255,255,0.3)',
                                        marginBottom: '12px'
                                    }} />
                                    <Typography sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}>
                                        No items scheduled
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {items.map((item, index) => {
                                        const config = TYPE_CONFIG[item.type];
                                        return (
                                            <ListItem
                                                key={`${item.type}-${item.id}`}
                                                onClick={() => handleClick(item)}
                                                sx={{
                                                    mb: 1.5,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderColor: 'rgba(108,99,255,0.3)',
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&:last-child': {
                                                        mb: 0
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    width: '100%'
                                                }}>
                                                    <Box sx={{
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        background: config.bg,
                                                        border: `1px solid ${config.color}40`,
                                                        color: config.color,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minWidth: 32,
                                                        height: 32
                                                    }}>
                                                        {config.icon}
                                                    </Box>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 0.5
                                                        }}>
                                                            <Typography sx={{
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                                fontSize: '0.9rem',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                flex: 1
                                                            }}>
                                                                {item.title}
                                                            </Typography>

                                                            <Chip
                                                                label={config.label}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 600,
                                                                    backgroundColor: config.bg,
                                                                    color: config.color,
                                                                    border: `1px solid ${config.color}40`,
                                                                    height: 20,
                                                                    '& .MuiChip-label': {
                                                                        px: 0.8
                                                                    }
                                                                }}
                                                            />
                                                        </Box>

                                                        {item.description && (
                                                            <Typography sx={{
                                                                color: 'rgba(255,255,255,0.6)',
                                                                fontSize: '0.8rem',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {item.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {selEpic && (
                <BigTaskDetailsModal
                    open={epicOpen}
                    onClose={closeEpic}
                    bigTask={selEpic}
                    onUpdated={() => onItemUpdated()}
                    container={container}
                />
            )}
            {selTask && (
                <TaskDetailsModal
                    open={taskOpen}
                    onClose={closeTask}
                    task={selTask}
                    onTaskUpdated={() => onItemUpdated()}
                    projectId={selTask?.project?.id}
                    container={container}
                />
            )}
        </>
    );
}
