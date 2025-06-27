// src/components/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                bgcolor: '#11',
                color: '#f4f5fa',
                pt: 3,
                pb: 3,
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: { xs: 2, md: 4 },
                    }}
                >
                    {/* Brand column */}
                    <Box sx={{ minWidth: 200, maxWidth: 280 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                            PowerBoard
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(244,245,250,0.7)', lineHeight: 1.4 }}>
                            simple, flexible, and powerful.
                        </Typography>
                    </Box>

                    {/* Right columns as a row */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 2, md: 4 }, // tighter
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                        }}
                    >
                        {/*/!* Solutions *!/*/}
                        {/*<Box>*/}
                        {/*    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>*/}
                        {/*        Solutions*/}
                        {/*    </Typography>*/}
                        {/*    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>*/}
                        {/*        <Link component={RouterLink} to="/ai-analytics" sx={{ color: 'rgba(244,245,250,0.7)', fontSize: 13, '&:hover': { color: '#fff' } }}>*/}
                        {/*            AI Analytics*/}
                        {/*        </Link>*/}
                        {/*        <Link component={RouterLink} to="/cloud-services" sx={{ color: 'rgba(244,245,250,0.7)', fontSize: 13, '&:hover': { color: '#fff' } }}>*/}
                        {/*            Cloud Services*/}
                        {/*        </Link>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}

                        {/*/!* Company *!/*/}
                        {/*<Box>*/}
                        {/*    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>*/}
                        {/*        Company*/}
                        {/*    </Typography>*/}
                        {/*    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>*/}
                        {/*        <Link component={RouterLink} to="/about" sx={{ color: 'rgba(244,245,250,0.7)', fontSize: 13, '&:hover': { color: '#fff' } }}>*/}
                        {/*            About Us*/}
                        {/*        </Link>*/}
                        {/*        <Link component={RouterLink} to="/careers" sx={{ color: 'rgba(244,245,250,0.7)', fontSize: 13, '&:hover': { color: '#fff' } }}>*/}
                        {/*            Careers*/}
                        {/*        </Link>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}

                        {/* Connect */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Connect
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    component="a"
                                    href="https://github.com/markdavidb"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: 'rgba(244,245,250,0.7)', p: 0.75, '&:hover': { color: '#fff' } }}
                                >
                                    <Github fontSize="small" />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href="https://twitter.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: 'rgba(244,245,250,0.7)', p: 0.75, '&:hover': { color: '#fff' } }}
                                >
                                    <Twitter fontSize="small" />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href="https://linkedin.com/in/markdavidb"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: 'rgba(244,245,250,0.7)', p: 0.75, '&:hover': { color: '#fff' } }}
                                >
                                    <Linkedin fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(244,245,250,0.6)' }}>
                        © {new Date().getFullYear()} markdavidb, All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
