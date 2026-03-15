import React, { useEffect, useMemo, useState } from 'react';
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
import { useAddItAdminClassMutation, useAddItAdminSectionMutation, useGetSchoolClassesAndTeachersQuery } from '../services/schoolApi';
import { clearAuthSession, getAuthSession } from '../utils/authSession';

function AddSectionClassPage() {
    const navigate = useNavigate();
    const { schoolId = '', role = '', userName = '' } = useParams();
    const authSession = getAuthSession();
    const normalizedSchoolId = schoolId.trim().toUpperCase();
    const normalizedRole = role.trim().toUpperCase();
    const allowedRoles = new Set(['SUPERADMIN', 'ITADMIN', 'OWNER']);

    const [classInput, setClassInput] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [sectionInput, setSectionInput] = useState('');

    const [classFormError, setClassFormError] = useState('');
    const [classFormSuccess, setClassFormSuccess] = useState('');
    const [sectionFormError, setSectionFormError] = useState('');
    const [sectionFormSuccess, setSectionFormSuccess] = useState('');

    const { data: schoolData, error: schoolDataError, refetch: refetchSchoolData } = useGetSchoolClassesAndTeachersQuery(normalizedSchoolId || undefined);
    const [addItAdminClass, { isLoading: isAddingClass }] = useAddItAdminClassMutation();
    const [addItAdminSection, { isLoading: isAddingSection }] = useAddItAdminSectionMutation();

    const classOptions = useMemo(() => {
        const deduplicated = new Map<string, { id: string; name: string }>();

        (schoolData?.classes ?? []).forEach((classItem) => {
            const id = String(classItem.classId || '').trim();
            const name = classItem.className.trim();
            if (!id || !name) {
                return;
            }

            if (!deduplicated.has(id)) {
                deduplicated.set(id, { id, name });
            }
        });

        return Array.from(deduplicated.values());
    }, [schoolData?.classes]);

    const teacherOptions = useMemo(() => {
        const deduplicated = new Map<string, { id: string; name: string }>();

        const teachers = schoolData?.teachers ?? [];
        return teachers
            .map((teacher) => ({
                id: String(teacher.teacherId || '').trim(),
                name: teacher.name.trim(),
            }))
            .filter((teacher) => teacher.id && teacher.name)
            .filter((teacher) => {
                if (deduplicated.has(teacher.id)) {
                    return false;
                }

                deduplicated.set(teacher.id, teacher);
                return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [schoolData?.teachers]);

    useEffect(() => {
        if (classOptions.length && !selectedClass) {
            setSelectedClass(classOptions[0].id);
        }

        if (selectedClass && !classOptions.some((item) => item.id === selectedClass)) {
            setSelectedClass(classOptions[0]?.id || '');
        }
    }, [classOptions, selectedClass]);

    useEffect(() => {
        if (teacherOptions.length && !selectedTeacher) {
            setSelectedTeacher(teacherOptions[0].id);
        }

        if (selectedTeacher && !teacherOptions.some((item) => item.id === selectedTeacher)) {
            setSelectedTeacher(teacherOptions[0]?.id || '');
        }
    }, [selectedTeacher, teacherOptions]);

    useEffect(() => {
        const status = (schoolDataError as { status?: number } | undefined)?.status;
        if (status === 401 || status === 403) {
            clearAuthSession();
            navigate(`/school/${schoolId}`, { replace: true });
        }
    }, [navigate, schoolId, schoolDataError]);

    const handleAddClass = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setClassFormError('');
        setClassFormSuccess('');

        const normalizedValue = classInput.trim();
        if (!normalizedValue) {
            setClassFormError('Class name is required.');
            return;
        }

        const classAlreadyExists = classOptions.some(
            (item) => item.name.toLowerCase() === normalizedValue.toLowerCase(),
        );

        if (classAlreadyExists) {
            setClassFormError('Class already exists in the list.');
            return;
        }

        const parsedClassName = /^[0-9]+$/.test(normalizedValue)
            ? Number(normalizedValue)
            : normalizedValue;

        try {
            const response = await addItAdminClass({
                class_name: parsedClassName,
            }).unwrap();

            setClassInput('');
            setClassFormSuccess(response.message || 'Class added. You can now add a section for it.');
            await refetchSchoolData();
        } catch (requestError: any) {
            const status = requestError?.status;
            if (status === 401 || status === 403) {
                clearAuthSession();
                navigate(`/school/${schoolId}`, { replace: true });
                return;
            }

            const apiMessage = typeof requestError?.data?.message === 'string'
                ? requestError.data.message
                : 'Unable to add class.';
            setClassFormError(apiMessage);
        }
    };

    const handleAddSection = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSectionFormError('');
        setSectionFormSuccess('');

        if (!selectedClass) {
            setSectionFormError('Please select a class.');
            return;
        }

        if (!selectedTeacher) {
            setSectionFormError('Please select a class teacher.');
            return;
        }

        if (!sectionInput.trim()) {
            setSectionFormError('Section is required.');
            return;
        }

        try {
            const response = await addItAdminSection({
                teacher_id: selectedTeacher,
                class_id: selectedClass,
                section_name: sectionInput.trim(),
            }).unwrap();

            const selectedClassLabel = classOptions.find((item) => item.id === selectedClass)?.name || selectedClass;
            const selectedTeacherLabel = teacherOptions.find((item) => item.id === selectedTeacher)?.name || selectedTeacher;
            setSectionFormSuccess(
                response.message || `Section ${sectionInput.trim()} added for ${selectedClassLabel} with ${selectedTeacherLabel}.`,
            );
            setSectionInput('');
        } catch (requestError: any) {
            const status = requestError?.status;
            if (status === 401 || status === 403) {
                clearAuthSession();
                navigate(`/school/${schoolId}`, { replace: true });
                return;
            }

            const apiMessage = typeof requestError?.data?.message === 'string'
                ? requestError.data.message
                : 'Unable to add section.';
            setSectionFormError(apiMessage);
        }
    };

    if (!authSession?.schoolCode || !authSession.role) {
        return <Navigate to={`/school/${schoolId}`} replace />;
    }

    if (!allowedRoles.has(authSession.role)) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}`} replace />;
    }

    if (authSession.schoolCode !== normalizedSchoolId) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-section-class`} replace />;
    }

    if (normalizedRole !== authSession.role) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-section-class`} replace />;
    }

    if (authSession.userName !== userName) {
        return <Navigate to={`/school/${authSession.schoolCode}/${authSession.role.toLowerCase()}/${authSession.userName}/add-section-class`} replace />;
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
                <Container maxWidth="md" sx={{ display: 'grid', gap: 2 }}>
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
                            Add Section / Class
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#7dd3fc' }}>
                            School ID: {schoolId}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 0.5, color: '#94a3b8', display: 'block' }}>
                            Class and teacher options are fetched from /teacher/classes-assigned.
                        </Typography>

                        <Box component="form" onSubmit={handleAddClass} sx={{ mt: 2, display: 'grid', gap: 1.5 }}>
                            <Typography variant="h6" sx={{ color: '#e2e8f0', fontSize: 18 }}>
                                Add Class
                            </Typography>
                            <TextField
                                label="Class"
                                fullWidth
                                value={classInput}
                                onChange={(event) => setClassInput(event.target.value)}
                                variant="outlined"
                            />
                            <Button type="submit" variant="contained" sx={{ justifySelf: 'start' }} disabled={isAddingClass}>
                                Add Class
                            </Button>
                        </Box>

                        {classFormError ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {classFormError}
                            </Alert>
                        ) : null}

                        {classFormSuccess ? (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {classFormSuccess}
                            </Alert>
                        ) : null}
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 4,
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        }}
                    >
                        <Box component="form" onSubmit={handleAddSection} sx={{ display: 'grid', gap: 1.5 }}>
                            <Typography variant="h6" sx={{ color: '#e2e8f0', fontSize: 18 }}>
                                Add Section
                            </Typography>

                            <TextField
                                label="Class"
                                select
                                fullWidth
                                value={selectedClass}
                                onChange={(event) => setSelectedClass(event.target.value)}
                                disabled={!classOptions.length}
                            >
                                {classOptions.length ? classOptions.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name}
                                    </MenuItem>
                                )) : (
                                    <MenuItem value="" disabled>
                                        No classes available
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                label="Class Teacher"
                                select
                                fullWidth
                                value={selectedTeacher}
                                onChange={(event) => setSelectedTeacher(event.target.value)}
                                disabled={!teacherOptions.length}
                            >
                                {teacherOptions.length ? teacherOptions.map((teacher) => (
                                    <MenuItem key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </MenuItem>
                                )) : (
                                    <MenuItem value="" disabled>
                                        No teachers available
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                label="Section"
                                fullWidth
                                value={sectionInput}
                                onChange={(event) => setSectionInput(event.target.value)}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ justifySelf: 'start' }}
                                disabled={!classOptions.length || !teacherOptions.length || isAddingSection}
                            >
                                Add Section
                            </Button>
                        </Box>

                        {sectionFormError ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {sectionFormError}
                            </Alert>
                        ) : null}

                        {sectionFormSuccess ? (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {sectionFormSuccess}
                            </Alert>
                        ) : null}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default AddSectionClassPage;
