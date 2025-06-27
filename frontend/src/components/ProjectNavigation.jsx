import React from 'react';
import { Link, useParams, useLocation, matchPath } from 'react-router-dom';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import { styled } from '@mui/system';

/* Config: label + url segment */
const tabs = [
    { label: 'Project Summary',  url: 'summary'    },
    { label: 'Project Board',    url: 'big_tasks'  },
    { label: 'Project Calendar', url: 'calendar'   },
];

/* Styled Tab: smaller and slimmer than default */
const LinkTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    minHeight: 28,          // ⬅️ Super slim
    height: 28,
    fontWeight: 500,
    fontSize: '0.97rem',
    paddingInline: theme.spacing(1.2),
    paddingBlock: 0,        // remove top/bottom padding
    lineHeight: 1.1,
}));

export default function ProjectNavigation() {
    const { projectId } = useParams();
    const { pathname }  = useLocation();
    const theme         = useTheme();

    const active = tabs.findIndex(t =>
        matchPath(`/projects/${projectId}/${t.url}`, pathname)
    );

    const href = (segment) => `/projects/${projectId}/${segment}`;

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 5,
                zIndex: 1099,
                backdropFilter: 'blur(8px)',
                background: 'rgba(24,25,38,0.93)',
                minHeight:35,  // matches the tab height
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Tabs
                    value={active === -1 ? false : active}
                    centered
                    TabIndicatorProps={{
                        style: {
                            height: 2,
                            borderRadius: 2,
                            background: theme.palette.primary.main,
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
