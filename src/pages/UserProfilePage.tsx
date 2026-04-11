import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Paper, Tab, Tabs, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import PasswordInput from '../components/PasswordInput';
import { changePassword } from '../services/authService';
import { ApiClientError } from '../utils/apiClient';
import { getAuthSession } from '../utils/authSession';

const inputSx = {
    '& .MuiInputLabel-root': { color: '#cbd5e1' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
    '& .MuiInputBase-input': { color: '#f8fafc' },
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(2, 6, 23, 0.55)',
        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
        '&:hover fieldset': { borderColor: 'rgba(125, 211, 252, 0.6)' },
        '&.Mui-focused fieldset': { borderColor: '#ffffff' },
    },
    '& .MuiIconButton-root': { color: '#94a3b8' },
};

function ResetPasswordTab() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validate = (): string => {
        if (!currentPassword.trim()) return 'Current password is required.';
        if (!newPassword.trim()) return 'New password is required.';
        if (newPassword.length < 8) return 'New password must be at least 8 characters.';
        if (!confirmPassword.trim()) return 'Please confirm your new password.';
        if (newPassword !== confirmPassword) return 'New password and confirm password do not match.';
        return '';
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const validationError = validate();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await changePassword(currentPassword, newPassword);
            setSuccessMessage(response.message || 'Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : 'Unable to change password. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <PasswordInput
                label="Current Password"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                sx={inputSx}
            />
            <PasswordInput
                label="New Password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={inputSx}
            />
            <PasswordInput
                label="Confirm New Password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={inputSx}
            />

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            <Box>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null}
                    sx={{ backgroundColor: '#0891b2', '&:hover': { backgroundColor: '#0e7490' } }}
                >
                    {isSubmitting ? 'Resetting…' : 'Reset Password'}
                </Button>
            </Box>
        </Box>
    );
}

function UserProfilePage() {
    const { schoolId = '', role = '', userName = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();
    const [activeTab, setActiveTab] = useState(0);

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
                        <Tabs
                            value={activeTab}
                            onChange={(_e, v) => setActiveTab(v)}
                            sx={{
                                mb: 2,
                                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                                '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 },
                                '& .Mui-selected': { color: '#67e8f9 !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#67e8f9' },
                            }}
                        >
                            <Tab label="Profile" />
                            <Tab label="Reset Password" />
                        </Tabs>

                        {activeTab === 0 && (
                            <>
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
                            </>
                        )}

                        {activeTab === 1 && (
                            <>
                                <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                                    Reset Password
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, color: '#94a3b8' }}>
                                    Enter your current password and choose a new one.
                                </Typography>
                                <ResetPasswordTab />
                            </>
                        )}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default UserProfilePage;
