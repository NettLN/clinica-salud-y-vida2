const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { Usuario } = require('./src/modules/users/models/Usuario');
const Rol = require('./src/modules/users/models/Rol');

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinica_salud_vida';
    console.log(`[Seeder] Conectando a MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Obteniendo roles del sistema...');
    const roles = await Rol.find({});
    if (roles.length === 0) {
       console.error('[Error] No se encontraron roles. Por favor ejecuta primero el servidor (server.js) para que se siembren los roles base.');
       process.exit(1);
    }

    const rolAdmin = roles.find(r => r.nombre === 'Administrador')._id;
    const rolMedico = roles.find(r => r.nombre === 'Medico')._id;
    const rolEnfermero = roles.find(r => r.nombre === 'Enfermero')._id;
    const rolPaciente = roles.find(r => r.nombre === 'Paciente')._id;

    console.log('[Seeder] Limpiando usuarios existentes...');
    await Usuario.deleteMany({});

    // Hash genérico para pruebas: "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);

    console.log('[Seeder] Creando Administrador...');
    await Usuario.create({
      nombre: 'Carlos',
      apellido: 'Administrador',
      ci: '1000001',
      email: 'admin@clinica.com',
      telefono: '70000001',
      password: hashedPassword,
      rolId: rolAdmin
    });

    console.log('[Seeder] Creando 3 Médicos...');
    const medicosData = [
      {
        nombre: 'Roberto',
        apellido: 'Gómez',
        ci: '2000001',
        email: 'medico.cardiologia@clinica.com',
        telefono: '70000002',
        password: hashedPassword,
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-101',
          especialidad: ['Cardiología']
        }
      },
      {
        nombre: 'María',
        apellido: 'Fernández',
        ci: '2000002',
        email: 'medico.pediatria@clinica.com',
        telefono: '70000003',
        password: hashedPassword,
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-102',
          especialidad: ['Pediatría']
        }
      },
      {
        nombre: 'Javier',
        apellido: 'López',
        ci: '2000003',
        email: 'medico.neurologia@clinica.com',
        telefono: '70000004',
        password: hashedPassword,
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-103',
          especialidad: ['Neurología']
        }
      }
    ];

    for (const m of medicosData) {
      await Usuario.create(m);
    }

    console.log('[Seeder] Creando 3 Enfermeros/as...');
    const enfermerosData = [
      {
        nombre: 'Elena',
        apellido: 'Rios',
        ci: '3000001',
        email: 'enfermero1@clinica.com',
        telefono: '70000007',
        password: hashedPassword,
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-201',
          especialidad: ['Cuidados Intensivos'],
          turno: 'Mañana',
          disponible: true
        }
      },
      {
        nombre: 'Gonzalo',
        apellido: 'Vargas',
        ci: '3000002',
        email: 'enfermero2@clinica.com',
        telefono: '70000008',
        password: hashedPassword,
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-202',
          especialidad: ['Emergencias'],
          turno: 'Tarde',
          disponible: true
        }
      },
      {
        nombre: 'Sofia',
        apellido: 'Torres',
        ci: '3000003',
        email: 'enfermero3@clinica.com',
        telefono: '70000009',
        password: hashedPassword,
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-203',
          especialidad: ['Pediatría'],
          turno: 'Noche',
          disponible: true
        }
      }
    ];

    for (const e of enfermerosData) {
      await Usuario.create(e);
    }

    console.log('[Seeder] Creando 3 Pacientes...');
    const pacientesData = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        ci: '4000001',
        email: 'paciente1@clinica.com',
        telefono: '70000012',
        password: hashedPassword,
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('1990-05-15'),
          direccion: 'Av. Las Palmas #123'
        }
      },
      {
        nombre: 'Lucía',
        apellido: 'Mendoza',
        ci: '4000002',
        email: 'paciente2@clinica.com',
        telefono: '70000013',
        password: hashedPassword,
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('1985-11-20'),
          direccion: 'Calle Los Olivos #456'
        }
      },
      {
        nombre: 'Mateo',
        apellido: 'Castro',
        ci: '4000003',
        email: 'paciente3@clinica.com',
        telefono: '70000014',
        password: hashedPassword,
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('2000-01-10'),
          direccion: 'Av. Principal #789'
        }
      }
    ];

    for (const p of pacientesData) {
      await Usuario.create(p);
    }

    console.log('\n======================================================');
    console.log('✅ BASE DE DATOS SEMBRADA CON ÉXITO');
    console.log('======================================================');
    console.log('🔑 Contraseña universal para todos los usuarios: 123456\n');
    console.log('--- ADMINISTRADOR (1) ---');
    console.log('📧 admin@clinica.com');

    console.log('\n--- MÉDICOS (3) ---');
    console.log('📧 medico.cardiologia@clinica.com   (Cardiología)');
    console.log('📧 medico.pediatria@clinica.com     (Pediatría)');
    console.log('📧 medico.neurologia@clinica.com    (Neurología)');

    console.log('\n--- ENFERMEROS/AS (3) ---');
    console.log('📧 enfermero1@clinica.com (Turno Mañana)');
    console.log('📧 enfermero2@clinica.com (Turno Tarde)');
    console.log('📧 enfermero3@clinica.com (Turno Noche)');

    console.log('\n--- PACIENTES (3) ---');
    console.log('📧 paciente1@clinica.com');
    console.log('📧 paciente2@clinica.com');
    console.log('📧 paciente3@clinica.com');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Fallo al sembrar usuarios:', error);
    process.exit(1);
  }
};

seedUsers();
