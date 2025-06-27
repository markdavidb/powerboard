import React from "react";
import { Box, Typography } from "@mui/material";
import { Calendar as CalendarIcon } from "lucide-react";
import CardShell from "./CardShell";

/* ── colour helper ───────────────────────────────── */
const statusColor = (s) => ({
    Done:          { bg: "rgba(34,197,94,0.13)",  fg: "#22c55e" },
    "In Progress": { bg: "rgba(37,99,235,0.16)",  fg: "#3b82f6" },
    default:       { bg: "rgba(156,163,175,0.14)", fg: "#9ca3af" },
}[s] || { bg: "rgba(156,163,175,0.14)", fg: "#9ca3af" });

/**
 * Project card
 * Props:
 *   • proj
 *   • bigTaskStats { total, done }   ← injected by ProjectsPage
 *   • onOpen()
 */
export default function ProjectCard({ proj, bigTaskStats, onOpen }) {
    const sc = statusColor(proj.status);
    const overdue =
        proj.due_date && new Date(proj.due_date) < new Date() && proj.status !== "Done";

    /* progress numbers */
    const totalBT = bigTaskStats?.total ?? (proj.big_tasks?.length || 0);
    const doneBT  = bigTaskStats?.done  ?? (proj.big_tasks?.filter((bt)=>bt.status==="Done").length || 0);
    const prog    = totalBT ? (doneBT / totalBT) * 100 : 0;

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
            {proj.status}
        </Box>
    );

    return (
        <CardShell
            isOverdue={overdue}
            statusPill={statusPill}
            buttonLabel="Open Project"
            onCardClick={onOpen}
            onButtonClick={onOpen}
        >
            {/* title */}
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
                {overdue && "⚠️ "}{proj.title}
            </Typography>


            {/* description */}
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
                {proj.description || "No description"}
            </Typography>



            {/* progress section (only if we know totals) */}
            {totalBT > 0 && (
                <>
                    <Box sx={{ mt: 0 }}>
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
                                    background: "linear-gradient(90deg,#818cf8 15%,#6366f1 100%)",
                                    borderRadius: 99,
                                    transition: "width .3s",
                                }}
                            />
                        </Box>
                    </Box>

                    {/* count line just like in BigTaskCard */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0 }}>
                        <Typography sx={{ fontWeight: 500, color: "#fff", fontSize: 15 }}>
                            {totalBT}
                        </Typography>
                        <Typography sx={{ color: "#a7a7b2", fontSize: 12 }}>
                            epics
                        </Typography>
                    </Box>
                </>
            )}

            {/* owner */}
            <Typography sx={{ fontSize: 12, color: "#b1b1b6", mt: 0.75 }}>
                Owner: {proj.owner?.username ?? "—"}
            </Typography>

            {/* due date */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    color: overdue ? "#f44336" : "#b1b1b6",
                    mt: 1,
                }}
            >
                <CalendarIcon size={14} style={{ marginRight: 6, opacity: 0.75 }} />
                {proj.due_date
                    ? new Date(proj.due_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "No due date"}
            </Box>
        </CardShell>
    );
}
