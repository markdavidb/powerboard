import React from "react";
import { Box, Button } from "@mui/material";
import { ArrowRight } from "lucide-react";

/**
 * Reusable blurred-glass card.
 *
 * Props
 * ─────
 * • isOverdue      → red border / glow
 * • statusPill     → JSX shown top-right
 * • children       → interior content
 * • buttonLabel    → footer button text
 * • onCardClick    → click anywhere
 * • onButtonClick  → click footer button
 */
export default function CardShell({
                                      isOverdue = false,
                                      statusPill = null,
                                      buttonLabel = "Open",
                                      onCardClick,
                                      onButtonClick,
                                      children,
                                  }) {
    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 280,
                maxWidth: 320,
                minHeight: 230,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                background: "rgba(24,24,30,0.80)",
                backdropFilter: "blur(24px)",
                border: "1.5px solid",
                borderColor: isOverdue ? "#f44336cc" : "rgba(34,36,51,0.88)",
                boxShadow: isOverdue
                    ? "0 0 8px rgba(244,67,54,0.1)"
                    : "0 4px 28px rgba(20,20,30,0.01)",
                transition: "all .25s ease",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-3px) scale(1.02)",
                    boxShadow: isOverdue
                        ? "0 0 12px rgba(244,67,54,0.1)"
                        : "0 2px 10px rgba(86,85,255,0.01)",
                },
            }}
            onClick={onCardClick}
        >
            {/* ─── top: status pill ─── */}
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.3, flexGrow: 1 }}>
                {statusPill && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        {statusPill}
                    </Box>
                )}

                {/* slot for inner content */}
                {children}
            </Box>

            {/* ─── footer button ─── */}
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Button
                    fullWidth
                    endIcon={<ArrowRight size={16} />}
                    sx={{
                        py: 1.2,
                        fontSize: 13,
                        color: "#bcbcc9",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            bgcolor: "rgba(32,32,45,0.15)",
                            color: "#fff",
                        },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onButtonClick();
                    }}
                >
                    {buttonLabel}
                </Button>
            </Box>
        </Box>
    );
}
