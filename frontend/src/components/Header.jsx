import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
  Skeleton,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bell, Menu, Slash } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import ColorModeContext from '../themes/ColorModeContext';
import { API } from '../api/axios';
import ProfileMenu from './ProfileMenu';
import NotificationsMenu from './NotificationsMenu';
import ProjectNavigation from './ProjectNavigation';

/* ────────────────────────────── constants ─── */
const drawerWidth = 280;
const crumbMap = {
  dashboard: 'Dashboard',
  projects : 'Projects',
  calendar : 'Calendar',
  profile  : 'Profile',
  big_tasks: 'Project Board',
  summary  : 'Project Summary',
  calendar_v: 'Project Calendar',
  board    : 'Project Board',
};

export default function Header({ onMenuClick, sidebarOpen }) {
  const theme         = useTheme();
  const isMobileView  = useMediaQuery(theme.breakpoints.down('md'));
  const location      = useLocation();
  const rawPath       = location.pathname;
  const navigate      = useNavigate();
  const { user, logout } = useAuth0();
  const { toggleColorMode } = useContext(ColorModeContext);

  /* ──────────────── breadcrumbs ───────────── */
  const pathname = useMemo(
    () => (/^\/projects\/\d+\/dashboard/.test(rawPath) ? '/dashboard' : rawPath),
    [rawPath]
  );

  const [projectTitles, setProjectTitles] = useState({});
  useEffect(() => {
    const parts = rawPath.split('/').filter(Boolean);
    const idx   = parts.indexOf('projects');
    if (idx >= 0 && /^\d+$/.test(parts[idx + 1])) {
      const id = parts[idx + 1];
      if (!projectTitles[id]) {
        API.project
          .get(`/projects/${id}`)
          .then(({ data }) =>
            setProjectTitles((p) => ({ ...p, [id]: data.title || `Project ${id}` }))
          )
          .catch(() =>
            setProjectTitles((p) => ({ ...p, [id]: `Project ${id}` }))
          );
      }
    }
  }, [rawPath, projectTitles]);

  const crumbs = useMemo(() => {
    const segs = pathname.split('/').filter(Boolean);
    return segs.map((seg, i) => {
      const isLast = i === segs.length - 1;
      if (/^\d+$/.test(seg))
        return {
          path : `/projects/${seg}/summary`,
          label: projectTitles[seg] || null,
          isLast,
          isProject: true,
        };
      return {
        path : '/' + segs.slice(0, i + 1).join('/'),
        label: crumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
        isLast,
        isProject: false,
      };
    });
  }, [pathname, projectTitles]);

  /* ───────────── profile / notifications ───── */
  const [profileEl, setProfileEl] = useState(null);
  const [bellEl, setBellEl]       = useState(null);
  const [unread, setUnread]       = useState(0);

  useEffect(() => {
    API.notification
      .get('/notifications/')
      .then(({ data }) => setUnread((data || []).filter((n) => !n.read).length))
      .catch(console.error);
  }, []);

  const { projectId } = useParams();
  const isProjectPage =
    Boolean(projectId) && rawPath.includes(`/projects/${projectId}`);

  /* ─────────────────────────── render ──────── */
  return (
    <Box sx={{ width: '100%' }}>
      {/* ────────── top bar ────────── */}
      <Box
        component="header"
        sx={{
          position : 'sticky',
          top      : 0,
          left     : !isMobileView && sidebarOpen ? `${drawerWidth}px` : 0,
          right    : 0,
          height   : 64,
          px       : { xs: 2, sm: 3 },
          display  : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(24,25,38,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isProjectPage
            ? 'none'
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
          transition: 'left 0.3s ease',
          zIndex: 1300,
        }}
      >
        {/* left: menu + crumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onMenuClick}
            sx={{
              p: 1,
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 1,
              '&:hover': { background: 'rgba(255,255,255,0.1)', color: '#fff' },
            }}
          >
            <Menu size={20} />
          </IconButton>

          {/* breadcrumbs */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
            }}
          >
            <Link
              to="/dashboard"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              PowerBoard
            </Link>

            {crumbs.map((c, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                <Slash
                  size={16}
                  style={{
                    margin: '0 8px',
                    transform: 'rotate(-15deg)',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                />
                {c.isProject && !c.label ? (
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={20}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                  />
                ) : c.isLast ? (
                  <Chip
                    label={c.label}
                    size="small"
                    sx={{
                      height     : 24,
                      background : 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                      color      : '#fff',
                      fontWeight : 600,
                      textTransform: 'capitalize',
                      '& .MuiChip-label': { px: 1.5 },
                    }}
                  />
                ) : (
                  <Link
                    to={c.path}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '4px 8px',
                      borderRadius: 1,
                    }}
                  >
                    {c.label}
                  </Link>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* right: actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


          <IconButton
            onClick={(e) => setBellEl(e.currentTarget)}
            sx={{
              p: 1,
              position: 'relative',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 1,
              '&:hover': { background: 'rgba(255,255,255,0.1)', color: '#fff' },
            }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '1px solid #181926',
                }}
              />
            )}
          </IconButton>

          <Tooltip title={user.name} placement="bottom-end">
            <IconButton
              onClick={(e) => setProfileEl(e.currentTarget)}
              sx={{
                p: 0.5,
                ml: 1,
                borderRadius: '50%',
                '&:hover': { background: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Avatar
                src={user.picture}
                sx={{
                  width: 32,
                  height: 32,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
            </IconButton>
          </Tooltip>

          <ProfileMenu
            anchorEl={profileEl}
            open={Boolean(profileEl)}
            onClose={() => setProfileEl(null)}
            name={user.name}
            role={user.email.split('@')[0]}
            avatar={user.picture}
            onSettings={() => navigate('/profile')}
            onLogout={logout}
          />
          <NotificationsMenu
            anchorEl={bellEl}
            open={Boolean(bellEl)}
            onClose={() => setBellEl(null)}
            onUnreadChange={setUnread}
          />
        </Box>
      </Box>

      {/* ─────── project navigation bar ─────── */}
      {isProjectPage && (
        <Box
            component="section"
          sx={{
            position : 'sticky',
            top      : 64,
            left     : !isMobileView && sidebarOpen ? `${drawerWidth}px` : 0,
            right    : 0,
            zIndex   : 1299,
            background: 'rgba(24,25,38,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            transition: 'left 0.3s ease',
          }}
        >
          <ProjectNavigation />
        </Box>
      )}
    </Box>
  );
}
