import React, { useEffect } from 'react';
import { Alert, Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import { useGetDashboardOverviewQuery } from '../services/schoolApi';
import { clearAuthSession, getAuthSession } from '../utils/authSession';

type OverviewStatCardProps = {
    title: string;
    value: React.ReactNode;
};

function OverviewStatCard({ title, value }: OverviewStatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(56, 189, 248, 0.25)',
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
            }}
        >
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {title}
            </Typography>
            <Typography variant="h5" sx={{ color: '#e2e8f0', mt: 0.5, fontWeight: 700 }}>
                {value ?? '-'}
            </Typography>
        </Paper>
    );
}

function OverviewList({ title, items }: { title: string; items: unknown[] }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.25)',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
            }}
        >
            <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1.5 }}>
                {title}
            </Typography>
            {items.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    No data available.
                </Typography>
            ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
                    {items.slice(0, 8).map((item, index) => {
                        const content = typeof item === 'string' ? item : JSON.stringify(item);
                        return (
                            <Box
                                key={`${title}-${index}`}
                                component="li"
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    color: '#cbd5e1',
                                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                                    fontSize: 14,
                                    wordBreak: 'break-word',
                                }}
                            >
                                {content}
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
}

function toObject(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function OverviewPage() {
    const navigate = useNavigate();
    const authSession = getAuthSession();
    const { data, isLoading, isError, error } = useGetDashboardOverviewQuery(undefined, {
        skip: !authSession?.token,
    });

    useEffect(() => {
        const status = (error as { status?: number } | undefined)?.status;
        if (status === 401 || status === 403) {
            clearAuthSession();
            navigate('/', { replace: true });
        }
    }, [error, navigate]);

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to="/" replace />;
    }

    const apiRole = String(data?.role || authSession.role || '').trim().toUpperCase();
    const roleData = toObject(data?.data);
    const stats = toObject(roleData.stats);

    const roleStatMap: Record<string, Array<{ title: string; key: string }>> = {
        OWNER: [
            { title: 'Total Students', key: 'totalStudents' },
            { title: 'Total Teachers', key: 'totalTeachers' },
            { title: 'Total Classes', key: 'totalClasses' },
            { title: 'Revenue', key: 'revenue' },
        ],
        IT_ADMIN: [
            { title: 'Total Users', key: 'totalUsers' },
            { title: 'Active Users', key: 'activeUsers' },
        ],
        TEACHER: [
            { title: 'Total Classes', key: 'totalClasses' },
            { title: 'Pending Attendance', key: 'pendingAttendance' },
        ],
        PARENT: [
            { title: 'Attendance %', key: 'attendancePercent' },
            { title: 'Fee Status', key: 'feeStatus' },
        ],
        STUDENT: [
            { title: 'Pending Assignments', key: 'pendingAssignments' },
            { title: 'Attendance %', key: 'attendancePercent' },
            { title: 'Upcoming Exams', key: 'upcomingExamsCount' },
        ],
    };

    const roleListMap: Record<string, Array<{ title: string; key: string }>> = {
        OWNER: [
            { title: 'Attendance Trend', key: 'attendanceTrend' },
            { title: 'Revenue Trend', key: 'revenueTrend' },
            { title: 'Notifications', key: 'notifications' },
        ],
        IT_ADMIN: [
            { title: 'Recent Users', key: 'recentUsers' },
            { title: 'Alerts', key: 'alerts' },
        ],
        TEACHER: [
            { title: "Today's Schedule", key: 'todaySchedule' },
            { title: 'Assignments To Review', key: 'assignmentsToReview' },
            { title: 'Notifications', key: 'notifications' },
        ],
        PARENT: [
            { title: 'Child Info', key: 'child' },
            { title: 'Recent Results', key: 'recentResults' },
            { title: 'Notifications', key: 'notifications' },
        ],
        STUDENT: [
            { title: "Today's Classes", key: 'todayClasses' },
            { title: 'Recent Marks', key: 'recentMarks' },
            { title: 'Upcoming Exams', key: 'upcomingExams' },
        ],
    };

    const roleStats = roleStatMap[apiRole] || [];
    const roleLists = roleListMap[apiRole] || [];

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            <LeftNavBar schoolId={authSession.schoolCode} role={authSession.role} userName={authSession.userName} />

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                <Container maxWidth="lg">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 4,
                            border: '1px solid rgba(56, 189, 248, 0.22)',
                            backgroundColor: 'rgba(2, 6, 23, 0.84)',
                            color: '#e2e8f0',
                        }}
                    >
                        <Typography variant="overline" sx={{ color: '#67e8f9', letterSpacing: 1.2 }}>
                            OVERVIEW
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {apiRole || 'USER'} Dashboard
                        </Typography>

                        {isLoading ? (
                            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CircularProgress size={18} sx={{ color: '#67e8f9' }} />
                                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                    Loading dashboard overview...
                                </Typography>
                            </Box>
                        ) : null}

                        {!isLoading && isError ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                Unable to load overview data.
                            </Alert>
                        ) : null}

                        {!isLoading && !isError ? (
                            <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 1.5,
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, minmax(0, 1fr))',
                                            lg: 'repeat(4, minmax(0, 1fr))',
                                        },
                                    }}
                                >
                                    {roleStats.length === 0 ? (
                                        <OverviewStatCard title="Status" value="No role stats mapping" />
                                    ) : (
                                        roleStats.map((item) => (
                                            <OverviewStatCard
                                                key={item.key}
                                                title={item.title}
                                                value={stats[item.key] as React.ReactNode}
                                            />
                                        ))
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 1.5,
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            md: 'repeat(2, minmax(0, 1fr))',
                                        },
                                    }}
                                >
                                    {roleLists.map((item) => {
                                        const source = roleData[item.key];
                                        const items = Array.isArray(source)
                                            ? toArray(source)
                                            : source && typeof source === 'object'
                                                ? [source]
                                                : [];

                                        return <OverviewList key={item.key} title={item.title} items={items} />;
                                    })}
                                </Box>
                            </Box>
                        ) : null}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default OverviewPage;
