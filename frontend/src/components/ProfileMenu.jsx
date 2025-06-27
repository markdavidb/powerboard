// src/components/ProfileMenu.jsx
import React from 'react';
import Popover from '@mui/material/Popover';
import {
    Box,
    Avatar,
    Typography,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme
} from '@mui/material';
import {
    Settings,
    LogOut,
    // other icons if you need them later
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

export default function ProfileMenu({
                                        anchorEl,
                                        open,
                                        onClose,
                                        name,
                                        role,
                                        avatar,
                                        subscription = 'Free Trial',
                                        onSettings,
                                        // onTerms,   // unused in this version
                                    }) {
    const theme = useTheme();
    const { logout } = useAuth0();

    const itemButtonSx = {
        px: 1.75,
        py: 1.1,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            background: 'rgba(255,255,255,0.03)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(3px)',
        },
        '& .MuiListItemIcon-root': {
            minWidth: 34,
            color: 'rgba(255,255,255,0.8)',
        },
        '& .MuiListItemText-primary': {
            color: '#f4f5fa',
        },
        '& .MuiListItemText-secondary': {
            color: 'rgba(200,200,220,0.5)',
        }
    };

    const handleLogout = () => {
        logout({
            federated: true,
            logoutParams: {
                client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                returnTo: window.location.origin + '/login',
            },
        });
        onClose();
    };

    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
                sx: {
                    width: 280,
                    borderRadius: 3,
                    background: 'rgba(24,24,30,0.82)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 6px 30px rgba(0,0,0,0.25)',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ p: 2 }}>
                {/* Avatar + name */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={avatar} sx={{ width: 54, height: 54 }} />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: '#00e676',
                                border: '2px solid rgba(24,24,30,0.9)'
                            }}
                        />
                    </Box>
                    <Box sx={{ ml: 1.5, maxWidth: 170 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 500,
                                color: '#fff',
                                fontSize: 15,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontSize: 13,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {role}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />

                {/* Settings */}
                <List disablePadding>
                    <ListItemButton onClick={() => { onSettings(); onClose(); }} sx={itemButtonSx}>
                        <ListItemIcon>
                            <Settings size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItemButton>
                </List>

                <Divider sx={{ my: 1.25, borderColor: 'rgba(255,255,255,0.08)' }} />

                {/* Logout */}
                <ListItemButton onClick={handleLogout} sx={itemButtonSx}>
                    <ListItemIcon>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
            </Box>
        </Popover>
    );
}
