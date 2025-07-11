import React, { useRef } from 'react';
import { Link, useParams, useLocation, matchPath } from 'react-router-dom';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const NAV_TABS = [
  { label: 'Project Summary', short: 'Summary',   url: 'summary'    },
  { label: 'Project Board',   short: 'Board',     url: 'big_tasks' },
  { label: 'Calendar',        short: 'Calendar',  url: 'calendar'  },
];

const LinkTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight   : 500,
  minHeight    : 56,
  height       : 56,
  '&.Mui-selected': { color: theme.palette.primary.main },
}));

export default function ProjectNavigation() {
  const { projectId } = useParams();
  const { pathname }  = useLocation();
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down('md'));

  const active = NAV_TABS.findIndex(t =>
    matchPath(`/projects/${projectId}/${t.url}`, pathname)
  );
  const lastActive = useRef(active >= 0 ? active : 0);
  if (active >= 0) lastActive.current = active;

  const href = seg => `/projects/${projectId}/${seg}`;

  return (
    <Box
      sx={{
        display     : 'flex',
        justifyContent: 'center',       // ← center the Tabs box itself
        px          : { xs: 1, sm: 2 }, // ← your gutter
        background  : 'rgba(24,25,38,0.9)',
        backdropFilter: 'blur(20px)',
        height      : 56,
      }}
    >
      <Tabs
        value={active >= 0 ? active : lastActive.current}
        variant={isMobile ? 'fullWidth' : 'standard'}
        centered={false}                 // ← no need, parent is doing the centering
        TabIndicatorProps={{
          style: {
            height      : 3,
            borderRadius: 2,
            background  : theme.palette.primary.main,
            opacity     : active === -1 ? 0 : 1,
          },
        }}
        sx={{
          // remove width: '100%' so the Tabs grow only to their content
          // if you want a small gap between tabs:
          columnGap: isMobile ? 0 : theme.spacing(4),
        }}
      >
        {NAV_TABS.map(t => (
          <LinkTab
            key={t.url}
            component={Link}
            to={href(t.url)}
            label={isMobile ? t.short : t.label}
          />
        ))}
      </Tabs>
    </Box>
  );
}
