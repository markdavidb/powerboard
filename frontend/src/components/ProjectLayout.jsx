import React from 'react';
import { Outlet }   from 'react-router-dom';
import { Box }      from '@mui/material';

export default function ProjectLayout() {
    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
            {/* page body */}
            <Box
                component="section"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1, sm: 2, md: 1 },
                    width: '100%',
                    maxWidth: 'calc(100vw - 240px)',
                    mx: 'auto',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
