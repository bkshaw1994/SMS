import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';
import { useAddUserMutation, useGetRolesQuery } from '../services/schoolApi';
import { clearAuthSession, getAuthSession } from '../utils/authSession';

function AddUserPage() {
    const navigate = useNavigate();
    const { schoolId = '', role = '', userName = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();
    const allowedRoles = new Set(['SUPERADMIN', 'ITADMIN', 'OWNER']);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newUserRole, setNewUserRole] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [addUser, { isLoading: isAddUserLoading }] = useAddUserMutation();

    const {
        data: roleOptions = [],
        isLoading: isRolesLoading,
        error: rolesQueryError,
    } = useGetRolesQuery();

    useEffect(() => {
        if (roleOptions.length && !roleOptions.includes(newUserRole)) {
            setNewUserRole(roleOptions[0]);
        }
    }, [newUserRole, roleOptions]);

    useEffect(() => {
        const status = (rolesQueryError as { status?: number } | undefined)?.status;
        if (status === 401 || status === 403) {
            clearAuthSession();
            navigate(`/school/${schoolId}`, { replace: true });
        }
    }, [navigate, rolesQueryError, schoolId]);

    const rolesError = rolesQueryError && roleOptions.length === 0
        ? 'Unable to load roles from API.'
        : '';

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

        if (!roleOptions.includes(newUserRole)) {
            return 'Please select a valid role.';
        }

        return '';
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errorMessage = validateForm();
        if (errorMessage) {
            setFormSuccess('');
            setFormError(errorMessage);
            return;
        }

        setFormError('');

        try {
            const response = await addUser({
                schoolCode: authSession?.schoolCode || normalizedSchoolId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                role: newUserRole,
                status: 'ACTIVE',
            }).unwrap();

            setFormSuccess(response.message || 'User added successfully.');
            setName('');
            setEmail('');
            setPhone('');
            if (roleOptions.length) {
                setNewUserRole(roleOptions[0]);
            }
        } catch (requestError: any) {
            const status = requestError?.status;
            if (status === 401 || status === 403) {
                clearAuthSession();
                navigate(`/school/${schoolId}`, { replace: true });
                return;
            }

            const apiMessage = typeof requestError?.data?.message === 'string'
                ? requestError.data.message
                : 'Unable to add user.';
            setFormSuccess('');
            setFormError(apiMessage);
        }
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
                                disabled={isRolesLoading || roleOptions.length === 0}
                            >
                                {roleOptions.map((roleOption) => (
                                    <MenuItem key={roleOption} value={roleOption}>
                                        {roleOption}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button type="submit" variant="contained" sx={{ justifySelf: 'start' }} disabled={isRolesLoading || isAddUserLoading}>
                                Add User
                            </Button>
                        </Box>

                        {rolesError ? (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                {rolesError}
                            </Alert>
                        ) : null}

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

export default AddUserPage;
