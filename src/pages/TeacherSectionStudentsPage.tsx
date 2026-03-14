import React from 'react';
import {
    Alert,
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import { useGetTeacherSectionStudentsQuery } from '../services/schoolApi';
import { getAuthSession } from '../utils/authSession';

function TeacherSectionStudentsPage() {
    const { schoolId = '', role = '', userName = '', sectionId = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();
    const decodedSectionId = decodeURIComponent(sectionId).trim();

    const { data, isLoading, error } = useGetTeacherSectionStudentsQuery(decodedSectionId, {
        skip: !decodedSectionId,
    });

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to={`/school/${schoolId}`} replace />;
    }

    if (authSession.schoolCode !== normalizedSchoolId) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    if (authSession.role !== normalizedRole) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    if (authSession.userName !== userName) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    const students = data ?? [];

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
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        }}
                    >
                        <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                            Section Students
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                            School ID: {schoolId}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#93c5fd' }}>
                            Section: {decodedSectionId || '-'}
                        </Typography>

                        {isLoading ? (
                            <Typography variant="body2" sx={{ mt: 2, color: '#cbd5e1' }}>
                                Loading students...
                            </Typography>
                        ) : null}

                        {error ? (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Unable to load students for this section.
                            </Alert>
                        ) : null}

                        {!isLoading && !error ? (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                    Total Students: {students.length}
                                </Typography>

                                {students.length ? (
                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            overflowX: 'auto',
                                            border: '1px solid rgba(148, 163, 184, 0.25)',
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Table size="small" sx={{ minWidth: 560 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                                        Student Name
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                                        Student ID
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                                        Roll No
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                                        Email
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {students.map((student, index) => (
                                                    <TableRow key={`${student.studentId}-${student.name}-${index}`}>
                                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{student.name || '-'}</TableCell>
                                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{student.studentId || '-'}</TableCell>
                                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{student.rollNo || '-'}</TableCell>
                                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{student.email || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                                        No students found for this section.
                                    </Typography>
                                )}
                            </Box>
                        ) : null}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default TeacherSectionStudentsPage;
