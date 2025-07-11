// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, ListSubheader, Box, Typography, Divider, Chip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
    LayoutDashboard, FolderKanban, Calendar,
    Shield, Settings, HelpCircle, LogOut,
} from 'lucide-react';
import useRoles from '../hooks/useRoles';
import HelpModal from './HelpModal';   // <--- Import your modal

const drawerWidth = 280;

const mainNav = [
    { text: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { text: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { text: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    // { text: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
];
// REMOVE 'Help' from extraNav - we'll handle it directly!
const extraNav = [
    { text: 'Settings', path: '/profile', icon: <Settings size={20} /> },
    // { text: 'Help', path: '/help', icon: <HelpCircle size={20} /> }, // Remove this
];

export default function Sidebar({ isMobile, isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth0();
    const { isAdmin, isLoading } = useRoles();

    const [helpOpen, setHelpOpen] = useState(false); // <--- NEW

    const isSelected = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const itemSx = (sel) => ({
        my: 0.2,
        mx: 1,
        px: 2,
        py: 1.5,
        height: 40,
        borderRadius: '8px',
        background: sel ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        color: sel ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
        fontWeight: sel ? 600 : 400,
        fontSize: '14px',
        border: sel ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
            background: sel
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '&:active': {
            transform: 'scale(0.98)',
        },
    });

    const clickNav = (path) => {
        if (location.pathname !== path) navigate(path);
        if (isMobile) onClose();
    };

    return (
        <>
            <Drawer
                variant={isMobile ? 'temporary' : 'persistent'}
                open={isOpen}
                onClose={onClose}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: '#181926',
                        color: '#ffffff',
                        borderRadius: 0,
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'none',
                    },
                }}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                {/* Logo Section */}
                <Box sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '14px',
                        }}>
                            P
                        </Box>
                        <Typography variant="h6" sx={{
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#ffffff',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}>
                            PowerBoard
                        </Typography>
                    </Box>
                </Box>

                {/* Main Navigation */}
                <Box sx={{ px: 2, py: 3 }}>
                    <Typography sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 2,
                        px: 2,
                    }}>
                        Navigation
                    </Typography>
                    <List sx={{ p: 0 }}>
                        {mainNav.map(({ text, path, icon }) => {
                            const sel = isSelected(path);
                            return (
                                <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                        <ListItemIcon sx={{
                                            minWidth: 28,
                                            color: 'inherit',
                                            '& svg': { strokeWidth: 1.5 }
                                        }}>
                                            {icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    fontSize: '14px',
                                                    fontWeight: 'inherit',
                                                }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}

                        {/* Admin Console with Badge */}
                        {!isLoading && isAdmin && (() => {
                            const path = '/admin/projects';
                            const sel = isSelected(path);
                            return (
                                <ListItem key="Admin Console" disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                        <ListItemIcon sx={{
                                            minWidth: 28,
                                            color: 'inherit',
                                            '& svg': { strokeWidth: 1.5 }
                                        }}>
                                            <Shield size={18} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Admin Console"
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    fontSize: '14px',
                                                    fontWeight: 'inherit',
                                                }
                                            }}
                                        />
                                        <Chip
                                            label="Admin"
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                background: 'rgba(245, 158, 11, 0.2)',
                                                color: '#fbbf24',
                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                '& .MuiChip-label': { px: 1 }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })()}
                    </List>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mx: 2 }} />

                {/* Settings Section */}
                <Box sx={{ px: 2, py: 3, flexGrow: 1 }}>
                    <Typography sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 2,
                        px: 2,
                    }}>
                        Settings
                    </Typography>
                    <List sx={{ p: 0 }}>
                        {extraNav.map(({ text, path, icon }) => {
                            const sel = isSelected(path);
                            return (
                                <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton sx={itemSx(sel)} onClick={() => clickNav(path)}>
                                        <ListItemIcon sx={{
                                            minWidth: 28,
                                            color: 'inherit',
                                            '& svg': { strokeWidth: 1.5 }
                                        }}>
                                            {icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    fontSize: '14px',
                                                    fontWeight: 'inherit',
                                                }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                        {/* Help item */}
                        <ListItem key="Help" disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                sx={itemSx(false)}
                                onClick={() => setHelpOpen(true)}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 28,
                                    color: 'inherit',
                                    '& svg': { strokeWidth: 1.5 }
                                }}>
                                    <HelpCircle size={18} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Help"
                                    sx={{
                                        '& .MuiTypography-root': {
                                            fontSize: '14px',
                                            fontWeight: 'inherit',
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>

                {/* Logout Button - Bottom */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)' }}>
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
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'transparent',
                            '&:hover': {
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 28,
                            color: 'inherit',
                            '& svg': { strokeWidth: 1.5 }
                        }}>
                            <LogOut size={18} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Sign out"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }
                            }}
                        />
                    </ListItemButton>
                </Box>
            </Drawer>
            <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
}
