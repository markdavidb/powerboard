// src/components/charts/ChartArea.jsx
import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Box,
    useTheme
} from '@mui/material';
import { TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

// month abbreviations
const monthNames = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
];

/**
 * Props:
 * • data = [{ month:"2025-01", open:5, closed:2 }, …]
 * • title, subtitle = strings
 */
export default function ChartArea({ data, title, subtitle }) {
    const theme = useTheme();

    // trailing percent change
    const last = data[data.length - 1] || { open: 0, closed: 0 };
    const prev = data[data.length - 2] || { open: 1, closed: 0 };
    const pct   = (((last.open + last.closed) - (prev.open + prev.closed)) /
        (prev.open + prev.closed)) * 100 || 0;

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                width: '100%',                  // fill Grid cell
                background: 'rgba(24,24,30,0.80)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 16px rgba(20,20,30,0.13)',
                borderRadius: 3
            }}
        >
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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        {subtitle}
                    </Typography>
                }
                sx={{ px: 2, pt: 2, '& .MuiCardHeader-content': { mt: 0 } }}
            />

            <CardContent sx={{ height: 200, px: 2 }}>
                <ResponsiveContainer width="100%" height="110%">
                    <AreaChart
                        data={data}
                        margin={{ top:30, right:20, bottom:0, left:20 }}
                    >
                        <defs>
                            <linearGradient id="openGrad"  x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.info.main}    stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.palette.info.main}    stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.07)" />

                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tick={({ x, y, payload }) => {
                                const [, m] = payload.value.split('-');
                                return (
                                    <text
                                        x={x}
                                        y={y + 15}
                                        textAnchor="middle"
                                        fill="rgba(255,255,255,0.6)"
                                        fontSize={13}
                                    >
                                        {monthNames[+m - 1]}
                                    </text>
                                );
                            }}
                        />

                        <Tooltip
                            contentStyle={{
                                background: '#1e1e2f',
                                border: 'none',
                                borderRadius: 4,
                                padding: '6px 10px'
                            }}
                            itemStyle={{ color: '#fff', fontSize: 12 }}
                            cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
                            labelFormatter={() => ''}
                        />

                        <Area
                            dataKey="open"
                            type="monotone"
                            stroke={theme.palette.info.main}
                            strokeWidth={2}
                            fill="url(#openGrad)"
                            dot={false}
                        />
                        <Area
                            dataKey="closed"
                            type="monotone"
                            stroke={theme.palette.success.main}
                            strokeWidth={2}
                            fill="url(#closeGrad)"
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>

            <CardActions sx={{ flexDirection:'column', alignItems:'flex-start', px:2, py:1 }}>

                <Typography variant="caption" color="text.secondary">
                    Last {data.length} months
                </Typography>
            </CardActions>
        </Card>
    );
}
