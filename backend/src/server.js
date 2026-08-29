const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { init } = require('./config/socket');
const initCronJobs = require('./jobs/cronJobs');
const { Administrador } = require('./modules/users/models/Usuario');

// Rutas
const authRoutes = require('./modules/users/routes/auth.routes');
const userRoutes = require('./modules/users/routes/user.routes');
const pharmacyRoutes = require('./modules/pharmacy/routes/pharmacy.routes');
const clinicRoutes = require('./modules/clinic/routes/clinic.routes');
const nursingRoutes = require('./modules/nursing/routes/nursing.routes');

// Seeders
const seedMedicamentos = require('../seeder');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Inicializar Socket.io
init(server);

// Inicializar Cron Jobs
initCronJobs();

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/nursing', nursingRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor Clínico corriendo exitosamente.' });
});

// Función para sembrar al Administrador
const seedAdmin = async () => {
  try {
    const adminExists = await Administrador.findOne({ email: 'admin@clinica.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt); // Contraseña "admin" solicitada
      
      const newAdmin = new Administrador({
        nombre: 'Super',
        apellido: 'Administrador',
        ci: '000000000',
        email: 'admin@clinica.com',
        password: hashedPassword
      });
      await newAdmin.save();
      console.log('[Seeder] Usuario Administrador creado con éxito (admin@clinica.com / admin)');
    }
  } catch (error) {
    console.error('[Seeder Error] No se pudo crear el admin:', error);
  }
};

const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('[Base de Datos] Conectada exitosamente a MongoDB');
    
    await seedAdmin(); // Ejecutamos el seeder de Admin
    await seedMedicamentos(); // Ejecutamos el seeder de Farmacia

    server.listen(PORT, () => {
      console.log(`[Servidor] Escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[Error DB] No se pudo conectar a MongoDB:', error.message);
  });
