import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarShell from '../../components/calendar/CalendarShell';
import useCalendarData from './useCalendarData';
import { Box } from '@mui/material'; // <--- import Box

function useMainCalendarDataHook() {
    return useCalendarData();
}

export default function MainCalendar() {
    const navigate = useNavigate();

    return (
        <Box sx={{ mt: { xs: 5, md: 3 } }}> {/* 👈👈 Add vertical space here! */}
            <CalendarShell
                useDataHook={useMainCalendarDataHook}
                onProjectClick={(proj) => navigate(`/projects/${proj.id}/summary`)}
                onEpicClick={() => {}}
                onTaskSaved={() => {}}
            />
        </Box>
    );
}
