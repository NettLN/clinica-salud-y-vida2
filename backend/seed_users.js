const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

<<<<<<< HEAD
const { Usuario } = require('./src/modules/users/models/Usuario');
const Rol = require('./src/modules/users/models/Rol');
=======
const { 
  Usuario, 
  Paciente, 
  Medico, 
  Enfermero, 
  Administrador 
} = require('./src/modules/users/models/Usuario');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinica_salud_vida';
    console.log(`[Seeder] Conectando a MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

<<<<<<< HEAD
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

=======
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    console.log('[Seeder] Limpiando usuarios existentes...');
    await Usuario.deleteMany({});

    // Hash genérico para pruebas: "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);

    console.log('[Seeder] Creando Administrador...');
<<<<<<< HEAD
    await Usuario.create({
=======
    await Administrador.create({
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      nombre: 'Carlos',
      apellido: 'Administrador',
      ci: '1000001',
      email: 'admin@clinica.com',
      telefono: '70000001',
<<<<<<< HEAD
      password: hashedPassword,
      rolId: rolAdmin
    });

    console.log('[Seeder] Creando 3 Médicos...');
=======
      password: hashedPassword
    });

    console.log('[Seeder] Creando 5 Médicos con especialidades distintas...');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    const medicosData = [
      {
        nombre: 'Roberto',
        apellido: 'Gómez',
        ci: '2000001',
        email: 'medico.cardiologia@clinica.com',
        telefono: '70000002',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-101',
          especialidad: ['Cardiología']
        }
=======
        matriculaProfesional: 'MP-101',
        especialidad: ['Cardiología']
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'María',
        apellido: 'Fernández',
        ci: '2000002',
        email: 'medico.pediatria@clinica.com',
        telefono: '70000003',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-102',
          especialidad: ['Pediatría']
        }
=======
        matriculaProfesional: 'MP-102',
        especialidad: ['Pediatría']
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'Javier',
        apellido: 'López',
        ci: '2000003',
        email: 'medico.neurologia@clinica.com',
        telefono: '70000004',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolMedico,
        datosMedico: {
          matriculaProfesional: 'MP-103',
          especialidad: ['Neurología']
        }
=======
        matriculaProfesional: 'MP-103',
        especialidad: ['Neurología']
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        ci: '2000004',
        email: 'medico.dermatologia@clinica.com',
        telefono: '70000005',
        password: hashedPassword,
        matriculaProfesional: 'MP-104',
        especialidad: ['Dermatología']
      },
      {
        nombre: 'Diego',
        apellido: 'Morales',
        ci: '2000005',
        email: 'medico.traumatologia@clinica.com',
        telefono: '70000006',
        password: hashedPassword,
        matriculaProfesional: 'MP-105',
        especialidad: ['Traumatología']
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      }
    ];

    for (const m of medicosData) {
<<<<<<< HEAD
      await Usuario.create(m);
    }

    console.log('[Seeder] Creando 3 Enfermeros/as...');
=======
      await Medico.create(m);
    }

    console.log('[Seeder] Creando 5 Enfermeros/as...');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    const enfermerosData = [
      {
        nombre: 'Elena',
        apellido: 'Rios',
        ci: '3000001',
        email: 'enfermero1@clinica.com',
        telefono: '70000007',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-201',
          especialidad: ['Cuidados Intensivos'],
          turno: 'Mañana',
          disponible: true
        }
=======
        matriculaProfesional: 'ENF-201',
        especialidad: ['Cuidados Intensivos'],
        turno: 'Mañana',
        disponible: true
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'Gonzalo',
        apellido: 'Vargas',
        ci: '3000002',
        email: 'enfermero2@clinica.com',
        telefono: '70000008',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-202',
          especialidad: ['Emergencias'],
          turno: 'Tarde',
          disponible: true
        }
=======
        matriculaProfesional: 'ENF-202',
        especialidad: ['Emergencias'],
        turno: 'Tarde',
        disponible: true
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'Sofia',
        apellido: 'Torres',
        ci: '3000003',
        email: 'enfermero3@clinica.com',
        telefono: '70000009',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolEnfermero,
        datosEnfermero: {
          matriculaProfesional: 'ENF-203',
          especialidad: ['Pediatría'],
          turno: 'Noche',
          disponible: true
        }
=======
        matriculaProfesional: 'ENF-203',
        especialidad: ['Pediatría'],
        turno: 'Noche',
        disponible: true
      },
      {
        nombre: 'Lucas',
        apellido: 'Pérez',
        ci: '3000004',
        email: 'enfermero4@clinica.com',
        telefono: '70000010',
        password: hashedPassword,
        matriculaProfesional: 'ENF-204',
        especialidad: ['Quirófano'],
        turno: 'Mañana',
        disponible: true
      },
      {
        nombre: 'Carla',
        apellido: 'Suárez',
        ci: '3000005',
        email: 'enfermero5@clinica.com',
        telefono: '70000011',
        password: hashedPassword,
        matriculaProfesional: 'ENF-205',
        especialidad: ['Geriatría'],
        turno: 'Tarde',
        disponible: true
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      }
    ];

    for (const e of enfermerosData) {
<<<<<<< HEAD
      await Usuario.create(e);
    }

    console.log('[Seeder] Creando 3 Pacientes...');
=======
      await Enfermero.create(e);
    }

    console.log('[Seeder] Creando 5 Pacientes...');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    const pacientesData = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        ci: '4000001',
        email: 'paciente1@clinica.com',
        telefono: '70000012',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('1990-05-15'),
          direccion: 'Av. Las Palmas #123'
        }
=======
        fechaNacimiento: new Date('1990-05-15'),
        direccion: 'Av. Las Palmas #123'
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'Lucía',
        apellido: 'Mendoza',
        ci: '4000002',
        email: 'paciente2@clinica.com',
        telefono: '70000013',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('1985-11-20'),
          direccion: 'Calle Los Olivos #456'
        }
=======
        fechaNacimiento: new Date('1985-11-20'),
        direccion: 'Calle Los Olivos #456'
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      },
      {
        nombre: 'Mateo',
        apellido: 'Castro',
        ci: '4000003',
        email: 'paciente3@clinica.com',
        telefono: '70000014',
        password: hashedPassword,
<<<<<<< HEAD
        rolId: rolPaciente,
        datosPaciente: {
          fechaNacimiento: new Date('2000-01-10'),
          direccion: 'Av. Principal #789'
        }
=======
        fechaNacimiento: new Date('2000-01-10'),
        direccion: 'Av. Principal #789'
      },
      {
        nombre: 'Valeria',
        apellido: 'Rojas',
        ci: '4000004',
        email: 'paciente4@clinica.com',
        telefono: '70000015',
        password: hashedPassword,
        fechaNacimiento: new Date('1995-07-25'),
        direccion: 'Calle Jacarandá #321'
      },
      {
        nombre: 'Andrés',
        apellido: 'Silva',
        ci: '4000005',
        email: 'paciente5@clinica.com',
        telefono: '70000016',
        password: hashedPassword,
        fechaNacimiento: new Date('1988-03-30'),
        direccion: 'Av. Bolivar #654'
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      }
    ];

    for (const p of pacientesData) {
<<<<<<< HEAD
      await Usuario.create(p);
=======
      await Paciente.create(p);
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    }

    console.log('\n======================================================');
    console.log('✅ BASE DE DATOS SEMBRADA CON ÉXITO');
    console.log('======================================================');
    console.log('🔑 Contraseña universal para todos los usuarios: 123456\n');
    console.log('--- ADMINISTRADOR (1) ---');
    console.log('📧 admin@clinica.com');

<<<<<<< HEAD
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
=======
    console.log('\n--- MÉDICOS (5) ---');
    console.log('📧 medico.cardiologia@clinica.com   (Cardiología)');
    console.log('📧 medico.pediatria@clinica.com     (Pediatría)');
    console.log('📧 medico.neurologia@clinica.com    (Neurología)');
    console.log('📧 medico.dermatologia@clinica.com   (Dermatología)');
    console.log('📧 medico.traumatologia@clinica.com  (Traumatología)');

    console.log('\n--- ENFERMEROS/AS (5) ---');
    console.log('📧 enfermero1@clinica.com (Turno Mañana)');
    console.log('📧 enfermero2@clinica.com (Turno Tarde)');
    console.log('📧 enfermero3@clinica.com (Turno Noche)');
    console.log('📧 enfermero4@clinica.com (Turno Mañana)');
    console.log('📧 enfermero5@clinica.com (Turno Tarde)');

    console.log('\n--- PACIENTES (5) ---');
    console.log('📧 paciente1@clinica.com');
    console.log('📧 paciente2@clinica.com');
    console.log('📧 paciente3@clinica.com');
    console.log('📧 paciente4@clinica.com');
    console.log('📧 paciente5@clinica.com');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Fallo al sembrar usuarios:', error);
    process.exit(1);
  }
};

seedUsers();
