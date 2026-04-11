import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { forgotPassword, verifyForgotPasswordOtp } from '../services/authService';
import { ApiClientError } from '../utils/apiClient';
import { useValidateLoginMutation } from '../services/schoolApi';

const fieldSx = {
    '& .MuiInputLabel-root': { color: '#cbd5e1' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
    '& .MuiInputBase-input': { color: '#f8fafc' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
        '&:hover fieldset': { borderColor: 'rgba(125, 211, 252, 0.6)' },
        '&.Mui-focused fieldset': { borderColor: '#ffffff' },
    },
};

type ForgotPasswordStep = 'email' | 'otp' | 'done';

type ForgotPasswordPanelProps = Readonly<{
    schoolCode: string;
    onCancel: () => void;
}>;

function ForgotPasswordPanel({ schoolCode, onCancel }: ForgotPasswordPanelProps) {
    const [step, setStep] = useState<ForgotPasswordStep>('email');
    const [fpEmail, setFpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');

        if (!fpEmail.trim()) {
            setErrorMessage('Email is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await forgotPassword(fpEmail.trim(), schoolCode);
            setSuccessMessage(response.message || 'OTP sent! Check your email.');
            setStep('otp');
        } catch (error) {
            const message =
                error instanceof ApiClientError ? error.message : 'Unable to send OTP. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');

        if (!otp.trim()) {
            setErrorMessage('OTP is required.');
            return;
        }
        if (!newPassword.trim()) {
            setErrorMessage('New password is required.');
            return;
        }
        if (newPassword.length < 8) {
            setErrorMessage('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await verifyForgotPasswordOtp(fpEmail.trim(), schoolCode, otp.trim(), newPassword, confirmPassword);
            setSuccessMessage(response.message || 'Password reset successfully.');
            setStep('done');
        } catch (error) {
            const message =
                error instanceof ApiClientError ? error.message : 'Invalid OTP. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#67e8f9', fontWeight: 600, mb: 1 }}>
                Forgot Password
            </Typography>

            {step === 'email' && (
                <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'grid', gap: 1.5 }}>
                    <TextField
                        label="Registered Email"
                        type="email"
                        fullWidth
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        required
                        sx={fieldSx}
                    />
                    {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null}
                            sx={{ backgroundColor: '#0891b2', '&:hover': { backgroundColor: '#0e7490' } }}
                        >
                            {isSubmitting ? 'Sending…' : 'Send OTP'}
                        </Button>
                        <Button
                            type="button"
                            variant="text"
                            onClick={onCancel}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#cbd5e1' } }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            )}

            {step === 'otp' && (
                <Box component="form" onSubmit={handleOtpSubmit} sx={{ display: 'grid', gap: 1.5 }}>
                    <Alert severity="info">{successMessage || 'Check your email for the 6-digit OTP.'}</Alert>
                    <TextField
                        label="Enter OTP"
                        fullWidth
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                        sx={fieldSx}
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        sx={fieldSx}
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        sx={fieldSx}
                    />
                    {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null}
                            sx={{ backgroundColor: '#0891b2', '&:hover': { backgroundColor: '#0e7490' } }}
                        >
                            {isSubmitting ? 'Verifying…' : 'Submit OTP'}
                        </Button>
                        <Button
                            type="button"
                            variant="text"
                            onClick={onCancel}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#cbd5e1' } }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            )}

            {step === 'done' && (
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Alert severity="success">{successMessage || 'Password reset successfully. You can now log in.'}</Alert>
                    <Button
                        type="button"
                        variant="text"
                        onClick={onCancel}
                        sx={{ justifySelf: 'start', color: '#67e8f9', '&:hover': { color: '#a5f3fc' } }}
                    >
                        Back to Login
                    </Button>
                </Box>
            )}
        </Box>
    );
}

function SchoolDetailsPage() {
    const navigate = useNavigate();
    const { schoolId = '' } = useParams();
    const normalizedSchoolCode = schoolId.trim().toUpperCase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [validateLogin, { data, error, isLoading }] = useValidateLoginMutation();

    const getApiErrorMessage = (requestError: any): string => {
        if (typeof requestError?.data?.message === 'string' && requestError.data.message) {
            return requestError.data.message;
        }

        if (typeof requestError?.error === 'string' && requestError.error) {
            return requestError.error;
        }

        return 'Login validation failed.';
    };

    const handleLoginValidate = async () => {
        if (!normalizedSchoolCode) {
            setFormError('School code is missing from route.');
            return;
        }

        if (!email.trim()) {
            setFormError('Email is required.');
            return;
        }

        if (!password.trim()) {
            setFormError('Password is required.');
            return;
        }

        setFormError('');

        try {
            const response = await validateLogin({
                valid: true,
                schoolCode: normalizedSchoolCode,
                email: email.trim(),
                password,
            }).unwrap();

            if (!response?.role) {
                setFormError('Role not returned from validate-login API.');
                return;
            }

            sessionStorage.setItem(
                'smsAuthSession',
                JSON.stringify({
                    schoolCode: response.schoolCode,
                    role: response.role,
                    email: response.email,
                    token: response.token,
                }),
            );

            const rolePath = response.role.toLowerCase();
            const userName = response.email.split('@')[0] || 'user';
            navigate(`/school/${response.schoolCode}/${rolePath}/${userName}`);
        } catch (requestError: any) {
            setFormError(getApiErrorMessage(requestError));
        }
    };

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
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        border: '1px solid rgba(125, 211, 252, 0.25)',
                        backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        color: '#e2e8f0',
                    }}
                >
                    <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                        School ID: {schoolId}
                    </Typography>

                    {showForgotPassword ? (
                        <ForgotPasswordPanel
                            schoolCode={normalizedSchoolCode}
                            onCancel={() => setShowForgotPassword(false)}
                        />
                    ) : (
                        <>
                            <Box sx={{ mt: 2, display: 'grid', gap: 1.5 }}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    variant="outlined"
                                    sx={fieldSx}
                                />

                                <TextField
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    variant="outlined"
                                    sx={fieldSx}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button
                                        type="button"
                                        onClick={handleLoginValidate}
                                        disabled={isLoading}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#0891b2',
                                            '&:hover': { backgroundColor: '#0e7490' },
                                        }}
                                    >
                                        {isLoading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Validate Login'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="text"
                                        onClick={() => { setShowForgotPassword(true); setFormError(''); }}
                                        sx={{ color: '#67e8f9', fontSize: '0.8rem', '&:hover': { color: '#a5f3fc' } }}
                                    >
                                        Forgot password?
                                    </Button>
                                </Box>
                            </Box>

                            {formError ? (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {formError}
                                </Alert>
                            ) : null}

                            {isLoading ? (
                                <Box sx={{ mt: 2 }}>
                                    <CircularProgress size={20} sx={{ color: '#67e8f9' }} />
                                </Box>
                            ) : null}

                            {!isLoading && error ? (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {(error as any)?.data?.message || 'Login validation failed.'}
                                </Alert>
                            ) : null}

                            {data?.valid ? (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                        Email: {data.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                        Role: {data.role}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1, color: '#67e8f9', wordBreak: 'break-all' }}
                                    >
                                        JWT: {data.token}
                                    </Typography>
                                </Box>
                            ) : null}
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default SchoolDetailsPage;
