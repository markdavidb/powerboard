import React, { useRef } from 'react';
import { Link, useParams, useLocation, matchPath } from 'react-router-dom';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const tabs = [
    { label: 'Project Summary',  url: 'summary'    },
    { label: 'Project Board',    url: 'big_tasks'  },
    { label: 'Project Calendar', url: 'calendar'   },
];

const LinkTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    minHeight: 28,
    height: 28,
    fontWeight: 500,
    fontSize: '0.97rem',
    paddingInline: theme.spacing(1.2),
    paddingBlock: 0,
    lineHeight: 1.1,
}));

export default function ProjectNavigation() {
    const { projectId } = useParams();
    const { pathname }  = useLocation();
    const theme         = useTheme();

    // Find current tab index or -1 if not found
    const active = tabs.findIndex(t =>
        matchPath(`/projects/${projectId}/${t.url}`, pathname)
    );

    // Remember the last valid active tab index
    const lastActiveTab = useRef(active >= 0 ? active : 0);
    if (active >= 0) lastActiveTab.current = active;

    const href = (segment) => `/projects/${projectId}/${segment}`;

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 5,
                zIndex: 1099,
                backdropFilter: 'blur(8px)',
                background: 'rgba(24,25,38,0.93)',
                minHeight: 35,
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Tabs
                    value={active >= 0 ? active : lastActiveTab.current}
                    centered
                    TabIndicatorProps={{
                        style: {
                            height: 2,
                            borderRadius: 2,
                            background: theme.palette.primary.main,
                            transition: 'opacity 0.2s, left 0.3s, width 0.3s',
                            opacity: active === -1 ? 0 : 1, // just fade out!
                        },
                    }}
                    sx={{
                        minHeight: 28,
                        height: 28,
                        '& .MuiTabs-flexContainer': { gap: 8 },
                    }}
                >
                    {tabs.map(t => (
                        <LinkTab
                            key={t.url}
                            label={t.label}
                            component={Link}
                            to={href(t.url)}
                        />
                    ))}
                </Tabs>
            </Box>
        </Box>
    );
}
