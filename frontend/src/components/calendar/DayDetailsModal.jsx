// src/pages/MainCalendar/DayDetailsModal.jsx
import React, {useState, useRef} from 'react';
import {
    Modal, Box, List, ListItem, ListItemText,
    Typography, IconButton, Divider
} from '@mui/material';
import {X} from 'lucide-react';
import {format} from 'date-fns';
import BigTaskDetailsModal from '../../components/BigTaskDetailsModal';
import TaskDetailsModal from '../../components/TaskDetailsModal';
import {useNavigate} from 'react-router-dom';

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
                console.log('Selected task:', item);
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
                disableEnforceFocus
                disableScrollLock
                BackdropProps={{sx: {backgroundColor: 'transparent'}}}
            >
                <Box
                    ref={modalRef}
                    sx={{
                        position: 'relative',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1300,
                        background: 'linear-gradient(135deg, rgba(30,30,47,0.85), rgba(20,20,30,0.8))',
                        backdropFilter: 'blur(18px)',
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                        p: 2,
                        width: '90vw',
                        maxWidth: 600,
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                        <Typography sx={{fontSize: '1.6rem', fontWeight: 600, color: '#fff'}}>
                            {date ? format(date, 'MMMM d, yyyy') : ''}
                        </Typography>
                        <IconButton onClick={onClose} sx={{color: '#ccc'}}>
                            <X size={24}/>
                        </IconButton>
                    </Box>
                    <Divider sx={{mb: 2, borderColor: 'rgba(255,255,255,0.1)'}}/>
                    <List>
                        {items.length === 0 ? (
                            <Typography sx={{color: '#aaa', textAlign: 'center', py: 5}}>
                                No due items for this day.
                            </Typography>
                        ) : (
                            items.map(it => (
                                <ListItem key={`${it.type}-${it.id}`} button onClick={() => handleClick(it)}>
                                    <ListItemText
                                        primary={<Typography
                                            sx={{color: '#fff', fontWeight: 500}}>{it.title}</Typography>}
                                        secondary={<Typography
                                            sx={{color: '#bbb'}}>{it.type.toUpperCase()}</Typography>}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Box>
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
