import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import tất cả các trang
import Users from './pages/Users';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Medicines from './pages/Medicines';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard';

// const Dashboard = () => <h2>Trang chủ thống kê (Sẽ vẽ biểu đồ vào đây)</h2>;
const Unauthorized = () => <h2>Bạn không có quyền truy cập trang này!</h2>;

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />

                {/* TUYỆT ĐỐI CHỈ ADMIN */}
                <Route path="users" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}><Users /></ProtectedRoute>
                } />

                {/* ADMIN + LỄ TÂN (Quản lý thu chi) */}
                <Route path="invoices" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST']}><Invoices /></ProtectedRoute>
                } />

                {/* CÁC ROUTE DÙNG CHUNG (Tất cả đều vào được, Frontend UI hoặc Backend sẽ tự khóa quyền Edit/Delete theo Role) */}
                <Route path="doctors" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><Doctors /></ProtectedRoute>
                } />
                <Route path="patients" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><Patients /></ProtectedRoute>
                } />
                <Route path="appointments" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><Appointments /></ProtectedRoute>
                } />
                <Route path="medicines" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><Medicines /></ProtectedRoute>
                } />
                <Route path="medical-records" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><MedicalRecords /></ProtectedRoute>
                } />
                <Route path="prescriptions" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}><Prescriptions /></ProtectedRoute>
                } />
            </Route>

            <Route path="*" element={<Unauthorized />} />
        </Routes>
    );
};

export default App;