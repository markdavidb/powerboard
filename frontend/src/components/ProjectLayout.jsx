import React from 'react';
import { Outlet }   from 'react-router-dom';
import { Box }      from '@mui/material';
import ProjectNavigation from './ProjectNavigation';

export default function ProjectLayout() {
    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
            {/* secondary nav bar */}
            <ProjectNavigation />

            {/* page body — give it a bit of top-padding so
          content never touches the nav’s border */}
            <Box
                component="section"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1, sm: 2, md: 1 },
                    width: '100%',
                    maxWidth: 'calc(100vw - 240px)',   /* leave room for sidebar */
                    mx: 'auto',

                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
