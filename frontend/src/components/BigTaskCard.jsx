import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Calendar as CalendarIcon } from "lucide-react";
import CardShell from "./CardShell";

/* colour helpers */
const statusColor = (s) => ({
    Done: { bg: "rgba(34,197,94,0.13)", fg: "#22c55e" },
    "In Progress": { bg: "rgba(37,99,235,0.16)", fg: "#3b82f6" },
    default: { bg: "rgba(156,163,175,0.14)", fg: "#9ca3af" },
}[s] || { bg: "rgba(156,163,175,0.14)", fg: "#9ca3af" });

const priorityColor = (p) => ({
    Highest: { bg: "rgba(244,67,54,0.2)", fg: "#f44336" },
    High: { bg: "rgba(255,152,0,0.2)", fg: "#ff9800" },
    Low: { bg: "rgba(156,39,176,0.2)", fg: "#9c27b0" },
    Lowest: { bg: "rgba(96,125,139,0.2)", fg: "#607d8b" },
    default: { bg: "rgba(158,158,158,0.2)", fg: "#9e9e9e" },
}[p] || { bg: "rgba(158,158,158,0.2)", fg: "#9e9e9e" });

export default function BigTaskCard({ bt, onNavigate, onDetails }) {
    const sc = statusColor(bt.status);
    const pc = priorityColor(bt.priority);

    const overdue =
        bt.due_date && new Date(bt.due_date) < new Date() && bt.status !== "Done";

    const done = bt.tasks?.filter((t) => t.status === "Done").length || 0;
    const total = bt.tasks?.length || 0;
    const prog = total ? (done / total) * 100 : 0;

    const statusPill = (
        <Box
            sx={{
                px: 1.4,
                py: 0.45,
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                bgcolor: sc.bg,
                color: sc.fg,
            }}
        >
            {bt.status}
        </Box>
    );

    return (
        <CardShell
            isOverdue={overdue}
            statusPill={statusPill}
            buttonLabel="View Details"
            onCardClick={onNavigate}
            onButtonClick={onDetails}
        >
            <Typography
                sx={{
                    fontWeight: 600,
                    color: overdue ? "#f44336" : "#fff",
                    fontSize: 16,
                    lineHeight: 1.25,
                    mb: -1,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",    // ⬅️ 1-line only
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-all",  // ⬅️ break long strings
                }}
            >
                {overdue && "⚠️ "}{bt.title}
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    color: "rgba(190,194,215,0.9)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    wordBreak: "break-word",   // ⬅️ breaks long words
                }}
            >
                {bt.description || "No description"}
            </Typography>


            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: 12,
                        color: "#b1b1b6",
                        fontWeight: 500,
                        mr: 0.5,
                        flexShrink: 0,
                    }}
                >
                    Priority:
                </Typography>
                <Chip
                    label={bt.priority}
                    size="small"
                    sx={{
                        bgcolor: pc.bg,
                        color: pc.fg,
                        fontWeight: 500,
                        width: "fit-content",
                    }}
                />
            </Box>

            {/* progress bar */}
            <Box sx={{ mt: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#b1b1b6",
                    }}
                >
                    <span>Progress</span>
                    <span>{Math.round(prog)}%</span>
                </Box>
                <Box
                    sx={{
                        height: 8,
                        width: "100%",
                        bgcolor: "rgba(255,255,255,0.08)",
                        borderRadius: 99,
                        overflow: "hidden",
                        mt: 0.6,
                    }}
                >
                    <Box
                        sx={{
                            height: "100%",
                            width: `${prog}%`,
                            /** FIX: use “background”, not bgcolor, for gradient */
                            background: "linear-gradient(90deg,#818cf8 15%,#6366f1 100%)",
                            borderRadius: 99,
                            transition: "width .3s",
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Typography sx={{ fontWeight: 500, color: "#fff", fontSize: 15 }}>
                    {total}
                </Typography>
                <Typography sx={{ color: "#a7a7b2", fontSize: 12 }}>tasks</Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    color: overdue ? "#f44336" : "#b1b1b6",
                    mt: 0,
                }}
            >
                <CalendarIcon size={14} style={{ marginRight: 6, opacity: 0.75 }} />
                Target:&nbsp;
                {bt.due_date
                    ? new Date(bt.due_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "—"}
            </Box>
        </CardShell>
    );
}
