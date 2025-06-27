// src/pages/MainCalendar/useCalendarData.js

import { useEffect, useState, useCallback } from 'react';
import { parseISO, format } from 'date-fns';
import { API } from '../../api/axios';

export default function useCalendarData() {
    const [map, setMap] = useState({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [projRes, epicRes, taskRes] = await Promise.all([
                API.project.get('/projects/'),
                API.project.get('/projects/big_tasks/big_tasks/', { params: { mine_only: true } }),
                API.project.get('/projects/tasks/'),
            ]);

            const byDate = {};
            const add = (iso, item) => {
                byDate[iso] = [...(byDate[iso] || []), item];
            };

            projRes.data.forEach(p => {
                if (p.due_date) {
                    const iso = format(parseISO(p.due_date), 'yyyy-MM-dd');
                    add(iso, { type: 'project', ...p });
                }
            });

            epicRes.data.forEach(e => {
                if (e.due_date) {
                    const iso = format(parseISO(e.due_date), 'yyyy-MM-dd');
                    add(iso, { type: 'epic', ...e });
                }
            });

            taskRes.data.forEach(t => {
                if (t.due_date) {
                    const iso = format(parseISO(t.due_date), 'yyyy-MM-dd');
                    add(iso, { type: 'task', ...t });
                }
            });

            setMap(byDate);
        } catch (err) {
            console.error('Main calendar load error', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return [map, load, loading];
}
