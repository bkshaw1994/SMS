import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AddUserPage from '../pages/AddUserPage';
import LandingPage from '../pages/LandingPage';
import OverviewPage from '../pages/OverviewPage';
import RoleLandingPage from '../pages/RoleLandingPage';
import SchoolDetailsPage from '../pages/SchoolDetailsPage';
import UserProfilePage from '../pages/UserProfilePage';

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/school/:schoolId" element={<SchoolDetailsPage />} />
                <Route path="/school/:schoolId/:role/:userName" element={<RoleLandingPage />} />
                <Route path="/school/:schoolId/:role/:userName/add-user" element={<AddUserPage />} />
                <Route path="/school/:schoolId/:role/:userName/profile" element={<UserProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;