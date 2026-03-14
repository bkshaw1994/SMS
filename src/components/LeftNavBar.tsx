import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ChevronsLeft, ChevronsRight, CircleUserRound, LayoutDashboard, LogOut, PlusSquare, UserPlus } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../services/schoolApi';
import { clearAuthSession } from '../utils/authSession';

type LeftNavBarProps = {
    schoolId: string;
    role: string;
    userName?: string;
};

const buildItemStyles = (isExpanded: boolean) => ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isExpanded ? 'flex-start' : 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: isActive ? '#082f49' : '#cbd5e1',
    backgroundColor: isActive ? '#67e8f9' : 'transparent',
    fontWeight: isActive ? 700 : 500,
    transition: 'background-color 180ms ease, color 180ms ease, transform 180ms ease',
});

function LeftNavBar({ schoolId, role, userName = '' }: LeftNavBarProps) {
    const [isExpanded, setIsExpanded] = useState(() => {
        const savedValue = localStorage.getItem('smsLeftNavExpanded');
        if (savedValue === null) {
            return true;
        }

        return savedValue === 'true';
    });
    const navigate = useNavigate();
    const [logout] = useLogoutMutation();
    const basePath = `/school/${schoolId}`;
    const normalizedRole = role.trim().toLowerCase();
    const canAccessAddUser = ['superadmin', 'itadmin', 'owner'].includes(normalizedRole);
    const canAccessSectionClass = ['superadmin', 'itadmin', 'owner'].includes(normalizedRole);
    const navItems = [
        {
            to: `${basePath}/${normalizedRole}/${userName || 'user'}`,
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        ...(canAccessAddUser
            ? [
                {
                    to: `${basePath}/${normalizedRole}/${userName || 'user'}/add-user`,
                    label: 'Add User',
                    icon: UserPlus,
                },
            ]
            : []),
        ...(canAccessSectionClass
            ? [
                {
                    to: `${basePath}/${normalizedRole}/${userName || 'user'}/add-section-class`,
                    label: 'Add Section/Class',
                    icon: PlusSquare,
                },
            ]
            : []),
    ];

    const profileNavItem = {
        to: `${basePath}/${normalizedRole}/${userName || 'user'}/profile`,
        label: 'Profile',
        icon: CircleUserRound,
    };
    const ProfileIcon = profileNavItem.icon;

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch {
            // Local logout should still complete if API call fails.
        } finally {
            clearAuthSession();
            navigate('/', { replace: true });
        }
    };

    const handleToggleSidebar = () => {
        setIsExpanded((prev) => {
            const nextValue = !prev;
            localStorage.setItem('smsLeftNavExpanded', String(nextValue));
            return nextValue;
        });
    };

    return (
        <Box
            component="aside"
            sx={{
                width: { xs: '100%', md: isExpanded ? 260 : 86 },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                position: { xs: 'relative', md: 'sticky' },
                top: { md: 0 },
                alignSelf: { md: 'flex-start' },
                borderRight: { md: '1px solid rgba(148, 163, 184, 0.25)' },
                borderBottom: { xs: '1px solid rgba(148, 163, 184, 0.25)', md: 'none' },
                backgroundColor: 'rgba(2, 6, 23, 0.75)',
                p: 2,
                height: { md: '100vh' },
                overflowY: { md: 'auto' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
                transition: 'width 180ms ease',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center', mb: 1 }}>
                {isExpanded ? (
                    <Typography variant="h6" sx={{ color: '#f8fafc', fontSize: 15 }}>
                        School ID: <Box component="span" sx={{ color: '#cbd5e1', fontSize: 20, fontWeight: 700 }}>{schoolId}</Box>
                    </Typography>
                ) : null}

                <IconButton
                    type="button"
                    aria-label={isExpanded ? 'Collapse navbar' : 'Expand navbar'}
                    onClick={handleToggleSidebar}
                    sx={{ color: '#cbd5e1' }}
                >
                    {isExpanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gap: 1 }}>
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.to} title={isExpanded ? '' : item.label} placement="right">
                            <NavLink to={item.to} style={buildItemStyles(isExpanded)}>
                                <Icon size={18} />
                                {isExpanded ? <span>{item.label}</span> : null}
                            </NavLink>
                        </Tooltip>
                    );
                })}
            </Box>

            <Box sx={{ mt: { xs: 1, md: 'auto' }, pt: 1.5 }}>
                <Box sx={{ display: 'grid', gap: 1, width: '100%' }}>
                    <Tooltip title={isExpanded ? '' : profileNavItem.label}>
                        <NavLink
                            to={profileNavItem.to}
                            style={(state) => ({
                                ...buildItemStyles(isExpanded)(state),
                                width: '100%',
                                boxSizing: 'border-box',
                            })}
                        >
                            <ProfileIcon size={18} />
                            {isExpanded ? <span>{profileNavItem.label}</span> : null}
                        </NavLink>
                    </Tooltip>

                    <Tooltip title="Logout">
                        <IconButton
                            type="button"
                            aria-label="Logout"
                            onClick={handleLogout}
                            sx={{
                                width: isExpanded ? '100%' : 42,
                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                alignSelf: isExpanded ? 'stretch' : 'center',
                                px: isExpanded ? 1.5 : 0,
                                gap: 1,
                                color: '#fca5a5',
                                border: '1px solid rgba(252, 165, 165, 0.35)',
                                borderRadius: 1.5,
                            }}
                        >
                            <LogOut size={16} />
                            {isExpanded ? <span style={{ fontSize: 14 }}>Logout</span> : null}
                        </IconButton>
                    </Tooltip>


                </Box>
            </Box>
        </Box >
    );
}

export default LeftNavBar;
