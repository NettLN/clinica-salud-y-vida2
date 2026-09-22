import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import RolesList from './pages/admin/roles/RolesList';
import UserManagement from './pages/admin/users/UserManagement';
import PatientDirectory from './pages/patients/PatientDirectory';
import AppointmentsManager from './pages/appointments/AppointmentsManager';
import TaskManager from './pages/nursing/TaskManager';

import DashboardHome from './pages/DashboardHome';
import DoctorSchedules from './pages/appointments/DoctorSchedules';
import DoctorAppointments from './pages/appointments/DoctorAppointments';
import AttendAppointment from './pages/appointments/AttendAppointment';
import DoctorTaskDelegation from './pages/nursing/DoctorTaskDelegation';
import ClinicalHistory from './pages/patients/ClinicalHistory';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyDispense from './pages/pharmacy/PharmacyDispense';
import PharmacyRequests from './pages/pharmacy/PharmacyRequests';

import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardHome />} />

              {/* Módulo Citas */}
              <Route path="/citas" element={
                <ProtectedRoute permisosRequeridos={['CITAS_VER']}>
                  <AppointmentsManager />
                </ProtectedRoute>
              } />
              <Route path="/horarios" element={
                <ProtectedRoute permisosRequeridos={['HORARIOS_CONFIGURAR']}>
                  <DoctorSchedules />
                </ProtectedRoute>
              } />
              <Route path="/doctor/citas" element={
                <ProtectedRoute permisosRequeridos={['CITAS_ATENDER', 'CONSULTAS_MEDICAS']}>
                  <DoctorAppointments />
                </ProtectedRoute>
              } />
              <Route path="/citas/atender/:id" element={
                <ProtectedRoute permisosRequeridos={['CITAS_ATENDER', 'CONSULTAS_MEDICAS']}>
                  <AttendAppointment />
                </ProtectedRoute>
              } />

              {/* Módulo Pacientes */}
              <Route path="/pacientes" element={
                <ProtectedRoute permisosRequeridos={['PACIENTES_REGISTRAR']}>
                  <PatientDirectory />
                </ProtectedRoute>
              } />
              <Route path="/historial" element={
                <ProtectedRoute permisosRequeridos={['HISTORIAL_VER']}>
                  <ClinicalHistory />
                </ProtectedRoute>
              } />

              {/* Módulo Enfermería */}
              <Route path="/enfermeria/tareas" element={
                <ProtectedRoute permisosRequeridos={['TAREAS_EJECUTAR', 'TAREAS_CREAR']}>
                  <TaskManager />
                </ProtectedRoute>
              } />
              <Route path="/doctor/tareas" element={
                <ProtectedRoute permisosRequeridos={['TAREAS_CREAR', 'CONSULTAS_MEDICAS']}>
                  <DoctorTaskDelegation />
                </ProtectedRoute>
              } />

              {/* Módulo Farmacia */}
              <Route path="/farmacia/inventario" element={
                <ProtectedRoute permisosRequeridos={['FARMACIA_VER']}>
                  <PharmacyInventory />
                </ProtectedRoute>
              } />
              <Route path="/farmacia/dispensar" element={
                <ProtectedRoute permisosRequeridos={['FARMACIA_DISPENSAR']}>
                  <PharmacyDispense />
                </ProtectedRoute>
              } />
              <Route path="/farmacia/solicitudes" element={
                <ProtectedRoute permisosRequeridos={['SOLICITUDES_MEDICAMENTOS_GESTIONAR', 'FARMACIA_SOLICITAR']}>
                  <PharmacyRequests />
                </ProtectedRoute>
              } />

              {/* Módulo Administración */}
              <Route path="/admin/usuarios" element={
                <ProtectedRoute permisosRequeridos={['USUARIOS_GESTIONAR']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute permisosRequeridos={['ROLES_GESTIONAR']}>
                  <RolesList />
                </ProtectedRoute>
              } />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
