import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorAppointments from './DoctorAppointments';
import PatientAppointments from './PatientAppointments';

const AppointmentsManager = () => {
  const { user } = useAuth();
  
  const permisos = user?.rolId?.permisos || [];
  const puedeAtender = permisos.includes('ATENDER_CITAS');
  
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Gestión de Citas</h1>
      
      {puedeAtender ? (
        <DoctorAppointments />
      ) : (
        <PatientAppointments />
      )}
    </div>
  );
};

export default AppointmentsManager;
