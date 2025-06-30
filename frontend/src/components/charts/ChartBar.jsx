import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, CardActions, Typography, Box, useTheme, Stack
} from '@mui/material';
import { TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, ReferenceLine
} from 'recharts';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const monthAbbr = monthNames.map(m => m.slice(0, 3));

// --- Custom Tooltip ---
function ChartTooltip({ active, payload }) {
    const theme = useTheme();
    if (!active || !payload || !payload.length) return null;

    const { month, open, closed } = payload[0].payload || {};
    const monthIdx = month?.split('-')[1] - 1;
    const label = monthAbbr[monthIdx] || '';

    return (
        <Box
            sx={{
                minWidth: 100,
                background: '#191927f5',
                borderRadius: 2,
                p: 1.25,
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
                    Open: <b style={{ color: theme.palette.info.main }}>{open ?? '-'}</b>
                </Typography>
                <Typography sx={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box component="span" sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        display: 'inline-block', bgcolor: theme.palette.success.main, mr: 0.7,
                    }} />
                    Closed: <b style={{ color: theme.palette.success.main }}>{closed ?? '-'}</b>
                </Typography>
            </Stack>
        </Box>
    );
}

export default function ChartBar({ data, title, subtitle }) {
    const theme = useTheme();
    const [activeIndex, setActiveIndex] = useState(null);

    const lastIdx = data.length - 1;
    const prevIdx = data.length - 2;
    const lastSum = data[lastIdx]
        ? (data[lastIdx].open || 0) + (data[lastIdx].closed || 0)
        : 0;
    const prevSum = data[prevIdx]
        ? (data[prevIdx].open || 0) + (data[prevIdx].closed || 0)
        : 0;

    let changeText;
    let changeValue = null;

    if (data.length < 2 || prevSum === 0) {
        changeText = 'N/A';
    } else {
        changeValue = ((lastSum - prevSum) / prevSum) * 100;
        changeText = `${changeValue > 0 ? 'up' : 'down'} by ${Math.abs(changeValue).toFixed(1)}% this period`;
    }

    // Only highlight border, do NOT modify width/position!
    const renderBarShape = (props) => {
        const { x, y, width, height, fill, index } = props;
        const isActive = index === activeIndex;
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={3}
                fill={fill}
                stroke={isActive ? fill : "none"}
                strokeWidth={isActive ? 2 : 0}
                style={{
                    transition: 'all 0.14s cubic-bezier(.4,2,.6,1)',
                }}
            />
        );
    };

    return (
        <Card
            elevation={0}
            sx={{
                background: 'rgba(24,24,30,0.80)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 28px rgba(20,20,30,0.13)',
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
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 13, mt: 0.5 }}
                    >
                        {subtitle}
                    </Typography>
                }
                sx={{ px: 2, pt: 2, '& .MuiCardHeader-content': { mt: 0 } }}
            />

            <CardContent sx={{ height: 170, px: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 0, bottom: 30, left: 0 }}
                        barCategoryGap="35%"
                        barGap={4}
                        onMouseMove={state => {
                            if (state.isTooltipActive && typeof state.activeTooltipIndex === 'number') {
                                setActiveIndex(state.activeTooltipIndex);
                            } else {
                                setActiveIndex(null);
                            }
                        }}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={({ x, y, payload }) => {
                                const [year, m] = payload.value.split('-');
                                const idx = parseInt(m, 10) - 1;
                                return (
                                    <text
                                        x={x}
                                        y={y + 15}
                                        textAnchor="middle"
                                        fill="rgba(255,255,255,0.75)"
                                        fontSize={12}
                                    >
                                        {monthAbbr[idx]}
                                    </text>
                                );
                            }}
                            interval={0}
                        />

                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: 'transparent' }}
                        />

                        <ReferenceLine stroke="rgba(255,255,255,0.10)" ifOverflow="visible" />

                        <Bar
                            dataKey="open"
                            fill={theme.palette.info.main}
                            radius={[4, 4, 0, 0]}
                            shape={renderBarShape}
                            isAnimationActive={false}
                        />
                        <Bar
                            dataKey="closed"
                            fill={theme.palette.success.main}
                            radius={[4, 4, 0, 0]}
                            shape={renderBarShape}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>

            <CardActions sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

                </Box>
                <Typography variant="caption" color="text.secondary">
                    Showing the last {data.length} months
                </Typography>
            </CardActions>
        </Card>
    );
}
