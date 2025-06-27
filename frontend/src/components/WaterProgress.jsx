import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function WaterProgress({ progress }) {
    const radius = 60; // 📈 increase radius a bit

    const fillColor = "#00ff88"; // neon green

    return (
        <div style={{
            width: radius * 2 + 10,
            height: radius * 2 + 10,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                position: 'absolute',
                width: radius * 2 + 10,
                height: radius * 2 + 10,
                borderRadius: '50%',
                border: '2px solid #00ff88', // thinner border
                zIndex: 1,
            }} />

            <div style={{
                width: radius * 2,
                height: radius * 2,
                zIndex: 2,
            }}>
                <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                        pathColor: fillColor,
                        trailColor: 'rgba(255, 255, 255, 0.2)',
                        textColor: '#ffffff',
                        textSize: '18px',
                        strokeLinecap: 'round',
                        strokeWidth: 8, // 📉 thinner progress line (default is 12)
                    })}
                />
            </div>
        </div>
    );
}
