import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import SchoolCodeForm from '../components/SchoolCodeForm';

function LandingPage() {
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        border: '1px solid rgba(125, 211, 252, 0.25)',
                        backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        backdropFilter: 'blur(8px)',
                        color: '#e2e8f0',
                        boxShadow:
                            '0 30px 60px rgba(2, 6, 23, 0.55), 0 12px 24px rgba(34, 211, 238, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                        animation: 'floatCard 4.8s ease-in-out infinite',
                        '@keyframes floatCard': {
                            '0%': {
                                transform: 'translateY(0px)',
                            },
                            '50%': {
                                transform: 'translateY(-10px)',
                            },
                            '100%': {
                                transform: 'translateY(0px)',
                            },
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: -2,
                            borderRadius: 'inherit',
                            background:
                                'linear-gradient(130deg, rgba(103, 232, 249, 0.3), rgba(15, 23, 42, 0.05), rgba(56, 189, 248, 0.25))',
                            zIndex: -1,
                            filter: 'blur(14px)',
                        },
                    }}
                >
                    <SchoolCodeForm />
                </Paper>
            </Container>
        </Box>
    );
}

export default LandingPage;
