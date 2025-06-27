// src/pages/ProjectCalendar/index.jsx
import React from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import CalendarShell from '../../components/calendar/CalendarShell';
import useCalendarData from './useCalendarData';

/**
 * Wrap your real hook so we only call hooks at the top level.
 */
function useProjectCalendarDataHook(/* currentDate */) {
    const { projectId } = useParams();
    return useCalendarData(projectId);
}

export default function ProjectCalendar() {
    const navigate = useNavigate();

    return (
        <CalendarShell
            useDataHook={useProjectCalendarDataHook}
            onProjectClick={(proj) => navigate(`/projects/${proj.id}/summary`)}
            onEpicClick={() => {}}
            onTaskSaved={() => {}}
        />
    );
}
