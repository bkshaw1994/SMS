import React, { useState } from 'react';
import { Alert, Box, Button, Container, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';

const USER_ROLE_OPTIONS = ['SUPERADMIN', 'OWNER', 'ITADMIN', 'STUDENT', 'PARENT'];

const getAuthSession = () => {
    try {
        const rawSession = sessionStorage.getItem('smsAuthSession');

        if (!rawSession) {
            return null;
        }

        const parsed = JSON.parse(rawSession);
        const email = String(parsed?.email ?? '').trim().toLowerCase();

        return {
            schoolCode: String(parsed?.schoolCode ?? '').trim().toUpperCase(),
            role: String(parsed?.role ?? '').trim().toUpperCase(),
            userName: email.split('@')[0] || '',
        };
    } catch {
        return null;
    }
};

function ItAdminAddUserPage() {
    const { schoolId = '', role = '', userName = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();
    const allowedRoles = new Set(['SUPERADMIN', 'ITADMIN', 'OWNER']);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newUserRole, setNewUserRole] = useState('STUDENT');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const validateForm = (): string => {
        if (name.trim().length < 2) {
            return 'Name should be at least 2 characters long.';
        }

        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            return 'Please enter a valid email address.';
        }

        if (!/^[0-9]{10,15}$/.test(phone.trim())) {
            return 'Phone should contain 10 to 15 digits.';
        }

        if (!USER_ROLE_OPTIONS.includes(newUserRole)) {
            return 'Please select a valid role.';
        }

        return '';
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errorMessage = validateForm();
        if (errorMessage) {
            setFormSuccess('');
            setFormError(errorMessage);
            return;
        }

        setFormError('');
        setFormSuccess('User form submitted successfully.');
    };

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to={`/school/${schoolId}`} replace />;
    }

    if (!allowedRoles.has(authSession.role)) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    if (authSession.schoolCode !== normalizedSchoolId) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-user`} replace />;
    }

    if (normalizedRole !== authSession.role) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-user`} replace />;
    }

    if (authSession.userName !== userName) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-user`} replace />;
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
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        }}
                    >
                        <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                            Add User
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                            Role: {authSession.role}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#7dd3fc' }}>
                            School ID: {schoolId}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 1.5 }}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                variant="outlined"
                            />

                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                variant="outlined"
                            />

                            <TextField
                                label="Phone"
                                fullWidth
                                value={phone}
                                onChange={(event) => setPhone(event.target.value.replace(/[^0-9]/g, ''))}
                                variant="outlined"
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 15 }}
                            />

                            <TextField
                                label="Role"
                                select
                                fullWidth
                                value={newUserRole}
                                onChange={(event) => setNewUserRole(event.target.value)}
                                variant="outlined"
                            >
                                {USER_ROLE_OPTIONS.map((roleOption) => (
                                    <MenuItem key={roleOption} value={roleOption}>
                                        {roleOption}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button type="submit" variant="contained" sx={{ justifySelf: 'start' }}>
                                Add User
                            </Button>
                        </Box>

                        {formError ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {formError}
                            </Alert>
                        ) : null}

                        {formSuccess ? (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {formSuccess}
                            </Alert>
                        ) : null}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default ItAdminAddUserPage;
