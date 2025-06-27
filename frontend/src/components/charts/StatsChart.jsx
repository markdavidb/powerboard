// src/components/charts/StatsChart.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    useTheme,
} from '@mui/material';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ReferenceLine,
} from 'recharts';

/**
 * Props
 * ──────────────────────────────────────────────────────────
 * • fetchData(range) → Promise resolving to
 *   [{ date: "Mar", value: 300 }, …]
 * • title (optional) default = "General Statistics"
 */
export default function StatsChart({ fetchData, title = 'General Statistics' }) {
    const theme = useTheme();

    // ⏱ period tabs (matches your mock-up)
    const ranges = [
        { label: 'Today',        value: '1d' },
        { label: 'Last week',    value: '7d' },
        { label: 'Last month',   value: '1m' },
        { label: 'Last 6 month', value: '6m' },
        { label: 'Year',         value: '1y' },
    ];

    const [range, setRange] = useState('1m');
    const [data,  setData ] = useState([]);

    // 📡 fetch on range change
    useEffect(() => {
        let active = true;
        fetchData(range)
            .then(res => {
                if (active) setData(res.data ?? res); // accept either {data:…} or raw array
            })
            .catch(console.error);
        return () => { active = false; };
    }, [range, fetchData]);

    return (
        <Card
            elevation={0}
            sx={{
                background: 'rgba(24,24,30,0.80)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
                borderRadius: 3,
            }}
        >
            {/* ─── Header with period toggles ─────────────────── */}
            <CardHeader
                title={
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                        {title}
                    </Typography>
                }
                subheader={
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                        {ranges.map(r => (
                            <Typography
                                key={r.value}
                                variant="body2"
                                onClick={() => setRange(r.value)}
                                sx={{
                                    cursor: 'pointer',
                                    color:
                                        range === r.value
                                            ? theme.palette.common.white
                                            : 'rgba(255,255,255,0.6)',
                                    fontWeight: range === r.value ? 600 : 400,
                                    transition: 'color .15s',
                                    '&:hover': { color: theme.palette.common.white },
                                }}
                            >
                                {r.label}
                            </Typography>
                        ))}
                    </Box>
                }
                sx={{ px: 2, pt: 2, '& .MuiCardHeader-content': { mt: 0 } }}
            />

            {/* ─── Chart ───────────────────────────────────────── */}
            <CardContent sx={{ height: 280, px: 1, pb: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        {/* hide axes & grid for the clean look */}
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} />

                        <Tooltip
                            contentStyle={{
                                background: '#1e1e2f',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 12px',
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2 }}
                            labelFormatter={() => ''}
                        />

                        {/* thin vertical cursor line (always visible on hover) */}
                        <ReferenceLine stroke="rgba(255,255,255,0.15)" ifOverflow="visible" />

                        <Line
                            type="natural"
                            dataKey="value"
                            stroke="#ff6b00"
                            strokeWidth={2.5}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
