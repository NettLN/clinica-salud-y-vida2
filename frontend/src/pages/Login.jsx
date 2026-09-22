import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [show2FA, setShow2FA] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userData = await login(email, password);
      
      if (userData.rol === 'Medico' || userData.rol === 'Enfermero') {
        setPendingUser(userData);
        setShow2FA(true);
      } else {
        redirectUser(userData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    }
  };

  const redirectUser = (userData) => {
    if (userData.rol === 'Administrador') navigate('/admin');
    else if (userData.rol === 'Medico') navigate('/medico');
    else if (userData.rol === 'Enfermero') navigate('/enfermeria');
    else if (userData.rol === 'Paciente') navigate('/paciente');
    else navigate('/');
  };

  const verify2FA = () => {
    if (pin === '1234') {
      setShow2FA(false);
      redirectUser(pendingUser);
    } else {
      setError('PIN 2FA Incorrecto.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900">CLÍNICA SALUD Y VIDA</h2>
          <p className="text-gray-500 mt-2">Inicia sesión en tu cuenta</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: admin@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>

      {show2FA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Verificación 2FA</h3>
            <p className="text-sm text-gray-600 mb-4">Por favor ingrese su PIN de seguridad de 4 dígitos.</p>
            <input 
              type="password"
              maxLength="4"
              className="w-full text-center text-2xl tracking-[1em] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => { setShow2FA(false); setPin(''); setPendingUser(null); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={verify2FA}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
