import React, { useEffect, useState } from "react";

export default function MouseGlow() {
    const [mouse, setMouse] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        const move = e => setMouse({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <div
            style={{
                pointerEvents: "none",
                position: "fixed",
                inset: 0,
                zIndex: 11, // Make sure it's above backgrounds but under your card!
                transition: "opacity 0.3s",
                background: `radial-gradient(600px at ${mouse.x}px ${mouse.y}px, rgba(29, 78, 216, 0.15), transparent 70%)`
            }}
        />
    );
}
