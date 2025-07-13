// ──────────────────────────────────────────────────────────────
// src/App.jsx  – updated auth-guard
// ──────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';

import Sidebar         from './components/Sidebar';
import Header          from './components/Header';
import LoginPage       from './pages/LoginPage';
import Dashboard       from './pages/Dashboard';
import ProjectsPage    from './pages/ProjectsPage';
import TaskBoard       from './pages/TaskBoard';
import ProjectLayout   from './components/ProjectLayout';
import ProjectSummary  from './pages/ProjectSummary';
import BigTasksPage    from './pages/BigTasksPage';
import ProjectCalendar from './pages/ProjectCalendar';
import MainCalendar    from './pages/MainCalendar';
import ProfilePage     from './pages/ProfilePage';
import AdminProjectsPage from './pages/AdminProjectsPage';
import AdminRoute        from './components/AdminRoute';

/* ──────────────────────────────────────────────────────────── */
/*  Robust auth guard                                           */
/* ──────────────────────────────────────────────────────────── */
function Protected({ children }) {
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    async function verify() {
      if (isLoading) return;
      try {
        // will refresh if possible, or throw if everything is stale
        await getAccessTokenSilently();
        setCheckingToken(false);
      } catch (err) {
        console.warn('⚠️  Access-token invalid – forcing logout', err);
        // clear any cached Auth0 data
        localStorage.clear();
        sessionStorage.clear();
        setCheckingToken(false);
        logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
      }
    }
    verify();
  }, [isLoading, getAccessTokenSilently, logout]);

  if (isLoading || checkingToken) return null;           // keep the splash blank
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/* ──────────────────────────────────────────────────────────── */
/*  Shell: sidebar + header + outlet                            */
/* ──────────────────────────────────────────────────────────── */
function Shell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Initialize as closed to prevent the open/close flicker on page load.
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  // This single useEffect handles closing the sidebar on mobile
  // when the screen size changes or when the user navigates.
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: {
            xs: 0,
            md: isSidebarOpen ? 0 : '-280px'
          },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Header
          onMenuClick={handleSidebarToggle}
          sidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Routes                                                      */
/* ──────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/"        element={<Navigate to="/login" replace />} />
      <Route path="/login"   element={<LoginPage />} />

      {/* authenticated */}
      <Route element={<Protected><Shell /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects"  element={<ProjectsPage />} />
        <Route path="/calendar"  element={<MainCalendar />} />
        <Route path="/profile"   element={<ProfilePage />} />

        {/* ADMIN CONSOLE */}
        <Route
          path="/admin/projects"
          element={
            <AdminRoute>
              <AdminProjectsPage />
            </AdminRoute>
          }
        />

        {/* project-scoped */}
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index            element={<Navigate to="big_tasks" replace />} />
          <Route path="summary"   element={<ProjectSummary />} />
          <Route path="calendar"  element={<ProjectCalendar />} />
          <Route path="board"     element={<TaskBoard />} />
          <Route path="big_tasks" element={<BigTasksPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
