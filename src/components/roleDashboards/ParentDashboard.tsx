import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

type DashboardProps = {
    schoolId: string;
};

function ParentDashboard({ schoolId }: DashboardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: '1px solid rgba(167, 139, 250, 0.35)',
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
            }}
        >
            <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                Parent Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                School ID: {schoolId}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#c4b5fd' }}>
                    Child progress, notices, fee summary, and teacher communication.
                </Typography>
            </Box>
        </Paper>
    );
}

export default ParentDashboard;
