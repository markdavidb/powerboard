// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';

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
import AdminRoute        from './components/AdminRoute';    // ← **import the dedicated guard**

/* ──────────────────────────────────────────────────────────── */
/*  Generic auth guard                                          */
/* ──────────────────────────────────────────────────────────── */
function Protected({ children }) {
    const { isAuthenticated, isLoading } = useAuth0();
    if (isLoading) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/* ──────────────────────────────────────────────────────────── */
/*  Shell: sidebar + header + outlet                            */
/* ──────────────────────────────────────────────────────────── */
function Shell() {
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header />
                <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
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

            {/* fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
