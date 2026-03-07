import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

type DashboardProps = {
    schoolId: string;
};

function StudentDashboard({ schoolId }: DashboardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: '1px solid rgba(236, 72, 153, 0.35)',
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
            }}
        >
            <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                Student Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                School ID: {schoolId}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#f9a8d4' }}>
                    Assignments, attendance, timetable, and upcoming activities.
                </Typography>
            </Box>
        </Paper>
    );
}

export default StudentDashboard;
