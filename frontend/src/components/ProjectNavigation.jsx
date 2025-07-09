import React, { useRef } from 'react';
import { Link, useParams, useLocation, matchPath } from 'react-router-dom';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const tabs = [
    {
        label: 'Project Summary',
        shortLabel: 'Summary',
        url: 'summary'
    },
    {
        label: 'Project Board',
        shortLabel: 'Board',
        url: 'big_tasks'
    },
    {
        label: 'Project Calendar',
        shortLabel: 'Calendar',
        url: 'calendar'
    },
];

const LinkTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    minHeight: { xs: 48, sm: 48 },
    height: { xs: 48, sm: 48 },
    fontWeight: 500,
    fontSize: { xs: '0.875rem', sm: '1rem' },
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    lineHeight: 1.2,
    minWidth: { xs: 90, sm: 120 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

export default function ProjectNavigation() {
    const { projectId } = useParams();
    const { pathname }  = useLocation();
    const theme         = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                minHeight: { xs: 56, sm: 56 },
                height: { xs: 56, sm: 56 },
                borderRadius: 0,
                mx: 0,
                mb: 0,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 0 }, width: '100%' }}>
                <Tabs
                    value={active >= 0 ? active : lastActiveTab.current}
                    variant={isMobile ? "fullWidth" : "centered"}
                    scrollButtons={isMobile ? false : "auto"}
                    allowScrollButtonsMobile={false}
                    TabIndicatorProps={{
                        style: {
                            height: 3,
                            borderRadius: 2,
                            background: theme.palette.primary.main,
                            transition: 'opacity 0.2s, left 0.3s, width 0.3s',
                            opacity: active === -1 ? 0 : 1,
                        },
                    }}
                    sx={{
                        minHeight: 56,
                        height: 56,
                        '& .MuiTabs-flexContainer': {
                            gap: { xs: 0, sm: 8 },
                            height: 56,
                        },
                        '& .MuiTabs-indicator': {
                            bottom: 4
                        },
                    }}
                >
                    {tabs.map(t => (
                        <LinkTab
                            key={t.url}
                            label={isMobile ? t.shortLabel : t.label}
                            component={Link}
                            to={href(t.url)}
                        />
                    ))}
                </Tabs>
            </Box>
        </Box>
    );
}
