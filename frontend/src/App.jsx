import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';

// Placeholder genérico para roles no implementados aún
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-500">Módulo en construcción...</p>
    <a href="/login" className="mt-6 text-blue-600 hover:underline">Ir al Login</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin/*" 
            element={<ProtectedRoute allowedRoles={['Administrador']}><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/medico/*" 
            element={<ProtectedRoute allowedRoles={['Medico']}><DoctorDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/paciente/*" 
            element={<ProtectedRoute allowedRoles={['Paciente']}><PatientDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/enfermeria/*" 
            element={<ProtectedRoute allowedRoles={['Enfermero']}><NurseDashboard /></ProtectedRoute>} 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
