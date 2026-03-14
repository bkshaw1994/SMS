import React from 'react';
import { Box, Container } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import ItAdminDashboard from '../components/roleDashboards/ItAdminDashboard';
import OwnerDashboard from '../components/roleDashboards/OwnerDashboard';
import ParentDashboard from '../components/roleDashboards/ParentDashboard';
import StudentDashboard from '../components/roleDashboards/StudentDashboard';
import SuperAdminDashboard from '../components/roleDashboards/SuperAdminDashboard';
import TeacherDashboard from '../components/roleDashboards/TeacherDashboard';
import { getAuthSession } from '../utils/authSession';

const normalizeRole = (value: string): string => value.trim().toUpperCase();

function RoleLandingPage() {
    const { schoolId = '', role = '', userName = '' } = useParams();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = normalizeRole(role);
    const authSession = getAuthSession();

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to={`/school/${schoolId}`} replace />;
    }

    if (authSession.schoolCode !== normalizedSchoolId) {
        return <Navigate to={`/school/${authSession.schoolCode}`} replace />;
    }

    if (authSession.role !== normalizedRole) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    if (authSession.userName !== userName) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    const dashboardByRole: Record<string, React.ReactNode> = {
        SUPERADMIN: <SuperAdminDashboard schoolId={schoolId} />,
        OWNER: <OwnerDashboard schoolId={schoolId} />,
        ITADMIN: <ItAdminDashboard schoolId={schoolId} />,
        STUDENT: <StudentDashboard schoolId={schoolId} />,
        PARENT: <ParentDashboard schoolId={schoolId} />,
        TEACHER: <TeacherDashboard schoolId={schoolId} />,
    };

    const selectedDashboard = dashboardByRole[normalizedRole];

    return (
        <Box
            component="main"
            sx={{
                height: { xs: 'auto', md: '100vh' },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: { md: 'hidden' },
            }}
        >
            <LeftNavBar schoolId={schoolId} role={authSession.role} userName={authSession.userName} />

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    p: { xs: 2, md: 3 },
                    overflowY: { md: 'auto' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                <Container maxWidth="md">
                    {selectedDashboard}
                </Container>
            </Box>
        </Box>
    );
}

export default RoleLandingPage;
