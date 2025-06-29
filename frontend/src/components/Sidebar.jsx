// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, ListSubheader, Box, Typography, Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
    LayoutDashboard, FolderKanban, Calendar,
    MessageSquare, Shield, Settings, HelpCircle, LogOut,
} from 'lucide-react';
import useRoles from '../hooks/useRoles';
import HelpModal from './HelpModal';   // <--- Import your modal

const drawerWidth = 224;
const accent = '#7c84ff';

const mainNav = [
    { text: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { text: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { text: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { text: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
];
// REMOVE 'Help' from extraNav - we'll handle it directly!
const extraNav = [
    { text: 'Settings', path: '/profile', icon: <Settings size={20} /> },
    // { text: 'Help', path: '/help', icon: <HelpCircle size={20} /> }, // Remove this
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth0();
    const { isAdmin, isLoading } = useRoles();

    const [helpOpen, setHelpOpen] = useState(false); // <--- NEW

    const isSelected = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const itemSx = (sel) => ({
        my: 0.4, pl: 3, pr: 1.5, height: 44,
        borderLeft: sel ? `4px solid ${accent}` : '4px solid transparent',
        background: sel ? 'rgba(120,105,255,0.12)' : 'transparent',
        color: sel ? accent : '#e4e5ed',
        fontWeight: sel ? 700 : 500,
        borderRadius: 0,
        transition: 'background 0.15s ease',
        '&:hover': {
            background: sel
                ? 'rgba(120,105,255,0.14)'
                : 'rgba(120,105,255,0.06)',
            color: sel ? accent : '#c8cbff',
        },
        '&:focus': { borderRadius: 0 },
    });

    const clickNav = (path) => location.pathname !== path && navigate(path);

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        background: '#181926',
                        color: '#f4f5fa',
                        borderRadius: 0,
                    },
                }}
            >
                {/* logo */}
                <Box sx={{
                    height: 62, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'rgba(24,25,38,0.85)',
                }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 900, fontSize: '1.3rem', letterSpacing: 1.8,
                        color: '#c5cae9', fontFamily: 'monospace',
                    }}>
                        PowerBoard
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: '#23243a', my: 1 }} />

                {/* main nav */}
                <List subheader={
                    <ListSubheader disableSticky sx={{
                        bgcolor: 'transparent', color: '#6c6f80', fontSize: 11,
                        letterSpacing: 1, pl: 3, pb: 0.5,
                    }}>
                        OVERVIEW
                    </ListSubheader>
                }>
                    {mainNav.map(({ text, path, icon }) => {
                        const sel = isSelected(path);
                        return (
                            <ListItem key={text} disablePadding>
                                <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                    <ListItemIcon sx={{ minWidth: 34 }}>{icon}</ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}

                    {/* Admin Console link */}
                    {!isLoading && isAdmin && (() => {
                        const path = '/admin/projects';
                        const sel = isSelected(path);
                        return (
                            <ListItem key="Admin Console" disablePadding>
                                <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                    <ListItemIcon sx={{ minWidth: 34 }}><Shield size={20} /></ListItemIcon>
                                    <ListItemText primary="Admin Console" />
                                </ListItemButton>
                            </ListItem>
                        );
                    })()}
                </List>

                {/* extra nav */}
                <List subheader={
                    <ListSubheader disableSticky sx={{
                        bgcolor: 'transparent', color: '#6c6f80', fontSize: 11,
                        letterSpacing: 1, mt: 1, pl: 3, pb: 0.5,
                    }}>
                        EXTRAS
                    </ListSubheader>
                } sx={{ mb: 'auto' }}>
                    {extraNav.map(({ text, path, icon }) => {
                        const sel = isSelected(path);
                        return (
                            <ListItem key={text} disablePadding>
                                <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                    <ListItemIcon sx={{ minWidth: 34 }}>{icon}</ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                    {/* Add Help item */}
                    <ListItem key="Help" disablePadding>
                        <ListItemButton
                            sx={itemSx(false)}
                            onClick={() => setHelpOpen(true)}
                        >
                            <ListItemIcon sx={{ minWidth: 34 }}>
                                <HelpCircle size={20} />
                            </ListItemIcon>
                            <ListItemText primary="Help" />
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* logout */}
                <List sx={{ mb: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => logout({
                                federated: true,
                                logoutParams: {
                                    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                                    returnTo: window.location.origin + '/login',
                                },
                            })}
                            sx={{
                                ...itemSx(false),
                                color: '#ff8a8a',
                                '&:hover': { background: 'rgba(255,80,120,0.08)', color: '#ffc0c0' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 34 }}><LogOut size={20} /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
}
