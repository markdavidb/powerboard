// src/pages/LoginPage.jsx
import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import MouseGlow from '../components/MouseGlow';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function LoginPage() {
    const {loginWithRedirect, isAuthenticated, isLoading} = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', {replace: true});
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading || isAuthenticated) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative',
                background: 'radial-gradient(circle at top left, #1e1e2f, #111)',
                overflow: 'hidden',
            }}
        >
            <MouseGlow/>
            {/* Centered hero area */}
            <Box sx={{
                flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Hero onLogin={loginWithRedirect}/>
            </Box>
            {/* Footer always at bottom */}
            <Footer/>
        </Box>
    );
}
