// src/components/BigTaskProgress.jsx
import React from 'react';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function BigTaskProgress({completed, total}) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div style={{width: 120, height: 120}}>
            <CircularProgressbar
                value={percentage}
                text={`${Math.round(percentage)}%`}
                styles={buildStyles({
                    pathColor: '#4CAF50',
                    textColor: '#fff',
                    trailColor: '#3b3f58',
                    backgroundColor: '#1f2133',
                })}
            />
        </div>
    );
}
