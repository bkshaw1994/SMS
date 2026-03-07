import React from 'react';
import { Alert, Box, Container, Paper, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import { getAuthSession } from '../utils/authSession';

function UserProfilePage() {
    const { schoolId = '', role = '', userName = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to={`/school/${schoolId}`} replace />;
    }

    if (authSession.schoolCode !== normalizedSchoolId) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/profile`} replace />;
    }

    if (authSession.role !== normalizedRole) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/profile`} replace />;
    }

    if (authSession.userName !== userName) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/profile`} replace />;
    }

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            <LeftNavBar schoolId={schoolId} role={authSession.role} userName={authSession.userName} />

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                <Container maxWidth="md">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 4,
                            border: '1px solid rgba(148, 163, 184, 0.35)',
                            backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        }}
                    >
                        <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                            Profile
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                            User: {authSession.userName}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#93c5fd' }}>
                            Email: {authSession.email}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#7dd3fc' }}>
                            Role: {authSession.role}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#7dd3fc' }}>
                            School ID: {authSession.schoolCode}
                        </Typography>

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Profile details are available for all logged-in users.
                        </Alert>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default UserProfilePage;
