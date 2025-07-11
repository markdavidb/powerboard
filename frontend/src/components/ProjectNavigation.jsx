import React, {useRef} from 'react';
import {Link, useParams, useLocation, matchPath} from 'react-router-dom';
import {Box, Tabs, Tab, useTheme, useMediaQuery} from '@mui/material';
import {styled} from '@mui/system';

const tabs = [
    {label: 'Project Summary', shortLabel: 'Summary', url: 'summary'},
    {label: 'Project Board', shortLabel: 'Board', url: 'big_tasks'},
    {label: 'Calendar', shortLabel: 'Calendar', url: 'calendar'},
];

const LinkTab = styled(Tab)(({theme}) => ({
    textTransform: 'none',
    fontWeight: 500,
    minHeight: 56,
    height: 56,
    '&.Mui-selected': {color: theme.palette.primary.main},
}));

export default function ProjectNavigation() {
    const {projectId} = useParams();
    const {pathname} = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const active = tabs.findIndex(t =>
        matchPath(`/projects/${projectId}/${t.url}`, pathname)
    );

    /* remember last valid tab so indicator doesn’t disappear on “deep” pages */
    const lastActive = useRef(active >= 0 ? active : 0);
    if (active >= 0) lastActive.current = active;

    const href = seg => `/projects/${projectId}/${seg}`;

    return (
        <Box
            sx={{
                minHeight: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                width: '100%',          /* <— stretch to full viewport */
                px: {xs: 1, sm: 2},   /* keep same gutter-width as content */
            }}
        >
            <Tabs
                value={active >= 0 ? active : lastActive.current}
                variant={isMobile ? 'fullWidth' : 'centered'}
                scrollButtons={isMobile ? false : 'auto'}
                allowScrollButtonsMobile={false}
                TabIndicatorProps={{
                    style: {
                        height: 3,
                        borderRadius: 2,
                        transition: 'opacity 0.2s, left 0.3s, width 0.3s',
                        background: theme.palette.primary.main,
                        opacity: active === -1 ? 0 : 1,
                    },
                }}
                sx={{
                    width: '100%',        /* <— no max-width cap */
                    '& .MuiTabs-flexContainer': {
                        gap: {xs: 0, sm: 8},
                    },
                }}
            >
                {tabs.map(t => (
                    <LinkTab
                        key={t.url}
                        component={Link}
                        label={isMobile ? t.shortLabel : t.label}
                        to={href(t.url)}
                    />
                ))}
            </Tabs>
        </Box>
    );
}
