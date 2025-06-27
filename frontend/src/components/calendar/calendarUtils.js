// src/pages/MainCalendar/calendarUtils.js
import {startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays} from 'date-fns';

export function buildWeeks(currentDate, weekStartsOn = 0) {
    const startDate = startOfWeek(startOfMonth(currentDate), {weekStartsOn});
    const endDate = endOfWeek(endOfMonth(currentDate), {weekStartsOn});
    const weeks = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(day));
            day = addDays(day, 1);
        }
        weeks.push(week);
    }
    return weeks;
}
