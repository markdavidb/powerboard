import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import { TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ReferenceLine,
} from 'recharts';

/**
 * Props:
 * • data = [{ month:"2024-01", created:10, completed:5 }, …]
 * • title, subtitle = strings
 */
export default function ChartLine({ data, title, subtitle }) {
    const theme = useTheme();
    const last   = data[data.length - 1]?.created  || 0;
    const prev   = data[data.length - 2]?.created  || 1;
    const change = (((last - prev) / prev) * 100).toFixed(1);

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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                        {subtitle}
                    </Typography>
                }
                sx={{ px: 2, pt: 2, '& .MuiCardHeader-content': { mt: 0 } }}
            />

            {/* ─────────── CHART ─────────── */}
            <CardContent sx={{ height: 220, px: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        {/* hide axes/grid for a clean canvas */}
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={false} />

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

                        {/* vertical cursor line on hover */}
                        <ReferenceLine stroke="rgba(255,255,255,0.15)" ifOverflow="visible" />

                        <Line
                            dataKey="created"
                            type="natural"
                            stroke="#4ade80"
                            strokeWidth={2.5}
                            dot={false}
                        />
                        <Line
                            dataKey="completed"
                            type="natural"
                            stroke="#f87171"
                            strokeWidth={2.5}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>

            {/* ─────────── FOOTER ─────────── */}
            <CardActions sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Trending {change > 0 ? 'up' : 'down'} by {Math.abs(change)}% this month
                    </Typography>
                    <TrendingUp size={16} color={change > 0 ? '#22c55e' : '#ef4444'} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Showing the last {data.length} months
                </Typography>
            </CardActions>
        </Card>
    );
}
