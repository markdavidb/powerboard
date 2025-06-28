import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Box,
    useTheme,
    Stack
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

// --- Custom Tooltip for AreaChart ---
function ChartAreaTooltip({ active, payload }) {
    const theme = useTheme();
    if (!active || !payload || !payload.length) return null;
    const { month } = payload[0]?.payload || {};
    const monthIdx = month?.split('-')[1] - 1;
    const label = monthNames[monthIdx] || '';

    // Get values (handles empty data gracefully)
    const open = payload.find(d => d.dataKey === 'open')?.value ?? '-';
    const closed = payload.find(d => d.dataKey === 'closed')?.value ?? '-';

    return (
        <Box
            sx={{
                minWidth: 105,
                background: '#191927f5',
                borderRadius: 2,
                p: 1.15,
                boxShadow: 'none',
                border: '1.5px solid rgba(108,99,255,0.10)',
                backdropFilter: 'blur(6px)',
            }}
        >
            <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#fff', mb: 0.5 }}>
                {label}
            </Typography>
            <Stack spacing={0.2}>
                <Typography sx={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box component="span" sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        display: 'inline-block', bgcolor: theme.palette.info.main, mr: 0.7,
                    }} />
                    Open: <b style={{ color: theme.palette.info.main }}>{open}</b>
                </Typography>
                <Typography sx={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box component="span" sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        display: 'inline-block', bgcolor: theme.palette.success.main, mr: 0.7,
                    }} />
                    Closed: <b style={{ color: theme.palette.success.main }}>{closed}</b>
                </Typography>
            </Stack>
        </Box>
    );
}

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
                            content={<ChartAreaTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.13)', strokeWidth: 1 }}
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
