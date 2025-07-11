// src/components/Header.jsx
import React, {useState, useEffect, useMemo, useContext} from 'react';
import {
    Box,
    IconButton,
    Avatar,
    Typography,
    Tooltip,
    useTheme,
    Skeleton,
    Badge,
    useMediaQuery,
} from '@mui/material';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {Bell, ChevronRight, Menu} from 'lucide-react';
import {useAuth0} from '@auth0/auth0-react';
import ColorModeContext from '../themes/ColorModeContext';
import {API} from '../api/axios';
import ProfileMenu from './ProfileMenu';
import NotificationsMenu from './NotificationsMenu';
import ProjectNavigation from './ProjectNavigation';
/* static labels for non-param routes */
const crumbMap = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    calendar: 'Calendar',
    profile: 'Profile',
    big_tasks: 'Project Board',
    summary: 'Project Summary',
    calendar_v: 'Project Calendar',
    board: 'Project Board',
};

export default function Header({onMenuClick}) {
    const navigate = useNavigate();
    const {pathname: rawPath} = useLocation();
    const theme = useTheme();
    const {user, logout} = useAuth0();
    const {toggleColorMode} = useContext(ColorModeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    /* ───────────────────────────── breadcrumbs (unchanged) ─── */
    const pathname = useMemo(() => (
        /^\/projects\/\d+\/dashboard(\/.*)?$/.test(rawPath)
            ? '/dashboard'
            : rawPath
    ), [rawPath]);

    /* fetch project names for breadcrumb */
    const [projectTitles, setProjectTitles] = useState({});
    useEffect(() => {
        const parts = rawPath.split('/').filter(Boolean);
        const idx = parts.indexOf('projects');
        if (idx >= 0 && /^\d+$/.test(parts[idx + 1])) {
            const id = parts[idx + 1];
            if (!projectTitles[id]) {
                API.project.get(`/projects/${id}`)
                    .then(({data}) => {
                        setProjectTitles(prev => ({...prev, [id]: data.title || `Project ${id}`}));
                    })
                    .catch(() => {
                        setProjectTitles(prev => ({...prev, [id]: `Project ${id}`}));
                    });
            }
        }
    }, [rawPath, projectTitles]);

    const crumbs = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean);
        return segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            if (/^\d+$/.test(seg)) {
                return {
                    path: `/projects/${seg}/summary`,
                    label: projectTitles[seg] || null,
                    isLast,
                    isProject: true,
                };
            }
            const path = '/' + segments.slice(0, idx + 1).join('/');
            return {
                path,
                label: crumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
                isLast,
                isProject: false,
            };
        });
    }, [pathname, projectTitles]);

    /* ───────────────────────────── profile pop-menu state ─── */
    const [profileEl, setProfileEl] = useState(null);
    const openProfile = (e) => setProfileEl(e.currentTarget);
    const closeProfile = () => setProfileEl(null);

    /* ───────────────────────────── notifications state ─────── */
    const [bellEl, setBellEl] = useState(null);
    const [unread, setUnread] = useState(0);

    // one-shot load of unread count
    useEffect(() => {
        (async () => {
            try {
                const {data} = await API.notification.get('/notifications/');
                setUnread((data || []).filter(n => !n.read).length);
            } catch (err) {
                console.error('Unread fetch failed', err);
            }
        })();
    }, []);

    const openBell = (e) => setBellEl(e.currentTarget);
    const closeBell = () => setBellEl(null);

    // Check if we're on a project page
    const {projectId} = useParams();
    const isProjectPage = projectId && location.pathname.includes(`/projects/${projectId}`);

    return (
        <Box sx={{width: '100%'}}>
            <Box
                component="header"
                sx={{
                    height: 64,
                    px: {xs: 2, sm: 3},
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: isProjectPage ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(14px)',
                    background: 'rgba(24,25,38,0.85)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{mr: 1}}
                    >
                        <Menu/>
                    </IconButton>
                    {/* ───────────── left: breadcrumbs ───────────── */}
                    <Box
                        sx={{
                            display: {xs: 'none', sm: 'flex'},
                            alignItems: 'center',
                            gap: 1,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#d1d5db',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Link to="/dashboard" style={{color: 'inherit', textDecoration: 'none'}}>
                            PowerBoard
                        </Link>

                        {crumbs.map((c, i) => (
                            <Box key={i} sx={{display: 'flex', alignItems: 'center'}}>
                                <ChevronRight
                                    size={16}
                                    style={{color: '#666', margin: '0 4px'}}
                                />

                                {c.isProject && c.label === null ? (
                                    <Skeleton
                                        variant="text"
                                        width={80}
                                        height={22}
                                        sx={{bgcolor: 'rgba(255,255,255,0.2)', marginRight: 1}}
                                    />
                                ) : c.isLast ? (
                                    <Typography
                                        sx={{
                                            color: theme.palette.text.primary,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {c.label}
                                    </Typography>
                                ) : (
                                    <Link
                                        to={c.path}
                                        style={{
                                            color: '#b0b0b0',
                                            textDecoration: 'none',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {c.label}
                                    </Link>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ───────────── right: icons & profile ───────────── */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: {xs: 0.5, sm: 1}}}>
                    {/* Bell with badge */}
                    <IconButton size="small" sx={{p: 1.2}} onClick={openBell}>
                        <Badge
                            color="error"
                            variant="dot"
                            overlap="circular"
                            invisible={unread === 0}
                            sx={{'& .MuiBadge-badge': {right: 0, top: 2}}}
                        >
                            <Bell size={18}/>
                        </Badge>
                    </IconButton>

                    {/* (optional) dark-mode toggle removed for brevity */}

                    {/* Avatar */}
                    <Tooltip title={user.name}>
                        <IconButton size="small" onClick={openProfile} sx={{p: 1.2, ml: 1}}>
                            <Avatar src={user.picture} sx={{width: 32, height: 32}}/>
                        </IconButton>
                    </Tooltip>

                    {/* Pop-overs */}
                    <ProfileMenu
                        anchorEl={profileEl}
                        open={Boolean(profileEl)}
                        onClose={closeProfile}
                        name={user.name}
                        role={user.email.split('@')[0]}
                        avatar={user.picture}
                        onSettings={() => navigate('/profile')}
                        onLogout={logout}
                    />

                    <NotificationsMenu
                        anchorEl={bellEl}
                        open={Boolean(bellEl)}
                        onClose={closeBell}
                        onUnreadChange={setUnread}
                    />
                </Box>
            </Box>

            {/* Project Navigation - only show on project pages */}
            {isProjectPage && (
                <Box
                    sx={{
                        width: '100%',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(14px)',
                        background: 'rgba(24,25,38,0.85)',
                        position: 'sticky',
                        top: 64,
                        zIndex: 1099,
                    }}
                >
                    <ProjectNavigation/>
                </Box>
            )}
        </Box>
    );
}
