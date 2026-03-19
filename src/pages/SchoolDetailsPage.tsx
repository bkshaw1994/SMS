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
import { useValidateLoginMutation } from '../services/schoolApi';

function SchoolDetailsPage() {
    const navigate = useNavigate();
    const { schoolId = '' } = useParams();
    const normalizedSchoolCode = schoolId.trim().toUpperCase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
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

            navigate('/overview', { replace: true });
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

                    <Box sx={{ mt: 2, display: 'grid', gap: 1.5 }}>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiInputLabel-root': { color: '#cbd5e1' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                                '& .MuiInputBase-input': { color: '#f8fafc' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                                    '&:hover fieldset': { borderColor: 'rgba(125, 211, 252, 0.6)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                                },
                            }}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiInputLabel-root': { color: '#cbd5e1' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                                '& .MuiInputBase-input': { color: '#f8fafc' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                                    '&:hover fieldset': { borderColor: 'rgba(125, 211, 252, 0.6)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                                },
                            }}
                        />

                        <Button
                            type="button"
                            onClick={handleLoginValidate}
                            disabled={isLoading}
                            variant="contained"
                            sx={{
                                justifySelf: 'start',
                                backgroundColor: '#0891b2',
                                '&:hover': { backgroundColor: '#0e7490' },
                            }}
                        >
                            Validate Login
                        </Button>
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
                </Paper>
            </Container>
        </Box>
    );
}

export default SchoolDetailsPage;
