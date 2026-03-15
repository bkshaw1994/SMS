import React from 'react';
import {
    Alert,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTeacherClassesAssignedQuery } from '../../services/schoolApi';

type DashboardProps = {
    schoolId: string;
};

function TeacherDashboard({ schoolId }: DashboardProps) {
    const navigate = useNavigate();
    const { role = 'teacher', userName = 'user' } = useParams();
    const { data, isLoading, error } = useGetTeacherClassesAssignedQuery(schoolId);
    const classes = data ?? [];

    const handleOpenSectionStudents = (sectionId: string) => {
        if (!sectionId) {
            return;
        }

        navigate(`/school/${schoolId}/${role}/${userName}/sections/${encodeURIComponent(sectionId)}/students`);
    };

    return (
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
                Teacher Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                School ID: {schoolId}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#93c5fd' }}>
                    Assigned classes fetched from /teacher/classes-assigned.
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#94a3b8' }}>
                    Double-click a row to view students in that section.
                </Typography>
            </Box>

            {isLoading ? (
                <Typography variant="body2" sx={{ mt: 2, color: '#cbd5e1' }}>
                    Loading assigned classes...
                </Typography>
            ) : null}

            {error ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Unable to load teacher classes.
                </Alert>
            ) : null}

            {!isLoading && !error ? (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        Total Classes: {classes.length}
                    </Typography>

                    {classes.length ? (
                        <Box
                            sx={{
                                mt: 1.5,
                                overflowX: 'auto',
                                border: '1px solid rgba(148, 163, 184, 0.25)',
                                borderRadius: 2,
                            }}
                        >
                            <Table size="small" sx={{ minWidth: 420 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                            Class
                                        </TableCell>
                                        <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                            Section
                                        </TableCell>
                                        <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                            Subject
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {classes.map((classItem, index) => {
                                        const className = classItem.className || `Class ${index + 1}`;
                                        const sectionName = classItem.sectionName || '-';
                                        const subjectName = classItem.subjectName || '-';
                                        const canOpenStudents = Boolean(classItem.sectionId || classItem.sectionName);

                                        return (
                                            <TableRow
                                                key={`${className}-${classItem.sectionName}-${classItem.subjectName}-${index}`}
                                                onDoubleClick={() => handleOpenSectionStudents(classItem.sectionId || classItem.sectionName)}
                                                sx={{
                                                    cursor: canOpenStudents ? 'pointer' : 'default',
                                                    '&:hover': {
                                                        backgroundColor: canOpenStudents ? 'rgba(30, 41, 59, 0.55)' : 'transparent',
                                                    },
                                                }}
                                            >
                                                <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{className}</TableCell>
                                                <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{sectionName}</TableCell>
                                                <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{subjectName}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                            No classes assigned.
                        </Typography>
                    )}
                </Box>
            ) : null}
        </Paper>
    );
}

export default TeacherDashboard;
