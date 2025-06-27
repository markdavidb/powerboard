//src/pages/ProjectCalendar/useCalendarData.js

import {useEffect, useState, useCallback} from 'react';
import {parseISO, format} from 'date-fns';
import {API} from '../../api/axios';

export default function useCalendarData(projectId) {
    const [map, setMap] = useState({});
    const [loading, setLoading] = useState(true);   // <--- ADD THIS

    const load = useCallback(async () => {
        setLoading(true);    // <--- ADD THIS
        try {
            // Fetch project, epics, and tasks in parallel
            const [projRes, epicsRes, tasksRes] = await Promise.all([
                API.project.get(`/projects/${projectId}`),
                API.project.get('/projects/big_tasks/big_tasks', {params: {project_id: projectId}}),
                API.project.get('/projects/tasks/', {params: {project_id: projectId}}),
            ]);

            const byDate = {};
            const add = (iso, item) => {
                byDate[iso] = [...(byDate[iso] || []), item];
            };

            // Project due date
            const proj = projRes.data;
            if (proj.due_date) {
                const iso = format(parseISO(proj.due_date), 'yyyy-MM-dd');
                add(iso, {type: 'project', ...proj});
            }

            // Epic due dates
            epicsRes.data.forEach(epic => {
                if (epic.due_date) {
                    const iso = format(parseISO(epic.due_date), 'yyyy-MM-dd');
                    add(iso, {type: 'epic', ...epic});
                }
            });

            // Task due dates
            tasksRes.data.forEach(task => {
                if (task.due_date) {
                    const iso = format(parseISO(task.due_date), 'yyyy-MM-dd');
                    add(iso, {type: 'task', ...task});
                }
            });

            setMap(byDate);
        } catch (err) {
            console.error('Calendar data load error', err);
        }finally {
            setLoading(false);  // <--- ADD THIS
        }
    }, [projectId]);

    // Load on mount or when projectId changes
    useEffect(() => {
        load();
    }, [load]);

    return [map, load, loading];
}
