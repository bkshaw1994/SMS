import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useGetItAdminUsersQuery } from '../../services/schoolApi';

type DashboardProps = {
    schoolId: string;
};

function ItAdminDashboard({ schoolId }: DashboardProps) {
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, error } = useGetItAdminUsersQuery();
    const users = useMemo(() => data?.users ?? [], [data]);
    const schoolCode = data?.schoolCode ?? schoolId;
    const totalCount = typeof data?.count === 'number' ? data.count : users.length;
    const roleOptions = useMemo(() => {
        const unique = Array.from(new Set(users.map((user) => user.role ?? 'UNKNOWN')));
        return ['ALL', ...unique];
    }, [users]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return users.filter((user) => {
            const matchesRole = roleFilter === 'ALL' || (user.role ?? 'UNKNOWN') === roleFilter;
            if (!matchesRole) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const haystack = [
                user.name,
                user.email,
                user.phone,
                user.whatsapp ?? '',
                user.role ?? '',
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedSearch);
        });
    }, [roleFilter, searchText, users]);

    useEffect(() => {
        setPage(0);
    }, [searchText, roleFilter, rowsPerPage]);

    const paginatedUsers = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredUsers.slice(start, start + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    return (
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
                IT Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: '#cbd5e1' }}>
                School ID: {schoolId}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#7dd3fc' }}>
                    User provisioning, device health, and integration monitoring.
                </Typography>
            </Box>

            {isLoading ? (
                <Typography variant="body2" sx={{ mt: 2, color: '#cbd5e1' }}>
                    Loading IT admin users...
                </Typography>
            ) : null}

            {error ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Unable to load IT admin users.
                </Alert>
            ) : null}

            {!isLoading && !error ? (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        School Code: {schoolCode}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        Count: {totalCount}
                    </Typography>

                    <Box sx={{ mt: 1.5, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' } }}>
                        <TextField
                            size="small"
                            label="Search users"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                        />
                        <TextField
                            size="small"
                            select
                            label="Filter by role"
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                        >
                            {roleOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1, color: '#cbd5e1' }}>
                        Showing: {filteredUsers.length}
                    </Typography>

                    <Box
                        sx={{
                            mt: 1.5,
                            overflowX: 'auto',
                            overflowY: 'auto',
                            maxHeight: { xs: 360, md: 'calc(100vh - 360px)' },
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        <Table size="small" stickyHeader sx={{ minWidth: 620 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>Name</TableCell>
                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>Email</TableCell>
                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>Phone</TableCell>
                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>Whatsapp</TableCell>
                                    <TableCell sx={{ color: '#bae6fd', borderColor: 'rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>Role</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedUsers.length ? paginatedUsers.map((user, index) => (
                                    <TableRow key={`${user.email}-${page}-${index}`}>
                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{user.name}</TableCell>
                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{user.email}</TableCell>
                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{user.phone}</TableCell>
                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{user.whatsapp ?? '-'}</TableCell>
                                        <TableCell sx={{ color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.2)' }}>{user.role ?? '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ color: '#cbd5e1', borderColor: 'rgba(148, 163, 184, 0.2)' }}>
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>

                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={(_event, nextPage) => setPage(nextPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(Number(event.target.value));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        sx={{
                            color: '#cbd5e1',
                            '.MuiTablePagination-selectIcon': { color: '#cbd5e1' },
                            '.MuiSvgIcon-root': { color: '#cbd5e1' },
                        }}
                    />
                </Box>
            ) : null}
        </Paper>
    );
}

export default ItAdminDashboard;
