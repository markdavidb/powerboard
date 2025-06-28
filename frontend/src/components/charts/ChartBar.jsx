// src/components/charts/ChartBar.jsx
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
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ReferenceLine
} from 'recharts';

// full month names and abbreviations
const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];
const monthAbbr = monthNames.map(m => m.slice(0,3));

/**
 * Props:
 * • data = [{ month: "2025-01", open: 120, closed: 80 }, …]
 * • title, subtitle = strings
 */
export default function ChartBar({ data, title, subtitle }) {
    const theme = useTheme();

    // month-over-month total change %
    const lastIdx = data.length - 1;
    const prevIdx = data.length - 2;
    const lastSum = data[lastIdx]
        ? (data[lastIdx].open||0) + (data[lastIdx].closed||0)
        : 0;
    const prevSum = data[prevIdx]
        ? (data[prevIdx].open||0) + (data[prevIdx].closed||0)
        : 1;
    const change = (((lastSum - prevSum) / prevSum) * 100).toFixed(1);

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
            {/* title + subtitle */}
            <CardHeader
                title={
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}
                    >
                        {title}
                    </Typography>
                }
                subheader={
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize:13, mt:0.5 }}
                    >
                        {subtitle}
                    </Typography>
                }
                sx={{ px:2, pt:2, '& .MuiCardHeader-content':{ mt:0 } }}
            />

            {/* the chart */}
            <CardContent sx={{ height:170, px:1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top:10, right:0, bottom:30, left:0 }}
                        barCategoryGap="25%"
                        barGap={6}
                    >
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={({ x, y, payload }) => {
                                const [year, m] = payload.value.split('-');
                                const idx = parseInt(m,10) - 1;
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
                            contentStyle={{
                                background: '#1e1e2f',
                                border:'none',
                                borderRadius:6,
                                padding:'8px 12px'
                            }}
                            itemStyle={{ color:'#fff' }}
                            cursor={{ fill:'rgba(255,255,255,0.05)' }}
                            labelFormatter={() => ''}
                        />

                        <ReferenceLine stroke="rgba(255,255,255,0.15)" ifOverflow="visible" />

                        <Bar dataKey="open"   fill={theme.palette.info.main}   radius={[4,4,0,0]} />
                        <Bar dataKey="closed" fill={theme.palette.success.main} radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>

            {/* footer with trend */}
            <CardActions sx={{ flexDirection:'column', alignItems:'flex-start', px:2, pb:2 }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                    {/*<Typography variant="body2" sx={{ fontWeight:500 }}>*/}
                    {/*    Trending {change>0?'up':'down'} by {Math.abs(change)}% this period*/}
                    {/*</Typography>*/}
                    <TrendingUp
                        size={16}
                        color={change>0 ? theme.palette.success.main : theme.palette.error.main}
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Showing the last {data.length} months
                </Typography>
            </CardActions>
        </Card>
    );
}
