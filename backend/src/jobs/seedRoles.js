const bcrypt = require('bcrypt');
const Rol = require('../modules/users/models/Rol');
const { Usuario } = require('../modules/users/models/Usuario');

const PERMISOS_SISTEMA = [
  // Citas y Agenda
  'HORARIOS_CONFIGURAR',
  'CITAS_VER',
  'CITAS_AGENDAR',
  'CITAS_ATENDER',
  'CONSULTAS_MEDICAS',
  'CITAS_REPROGRAMAR_CANCELAR',

  // Historial Clínico
  'HISTORIAL_VER',
  'HISTORIAL_CREAR_EVOLUCION',
  'HISTORIAL_ADJUNTAR_DOCUMENTOS',

  // Gestión de Pacientes
  'PACIENTES_REGISTRAR',

  // Tareas de Enfermería
  'TAREAS_CREAR',
  'TAREAS_EJECUTAR',
  'TAREAS_AUDITAR',

  // Farmacia e Inventario
  'FARMACIA_VER',
  'FARMACIA_GESTIONAR_INVENTARIO',
  'FARMACIA_RECETAR',
  'FARMACIA_SOLICITAR',
  'FARMACIA_DISPENSAR',
  'SOLICITUDES_MEDICAMENTOS_GESTIONAR',

  // Administración
  'ROLES_GESTIONAR',
  'USUARIOS_GESTIONAR',
  'REPORTES_VER'
];

const seedRolesAndAdmin = async () => {
  try {
    // 1. Sembrar Roles Base
    const rolesBase = [
      {
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema',
        esRolSistema: true,
        permisos: PERMISOS_SISTEMA // Todos los permisos
      },
      {
        nombre: 'Medico',
        descripcion: 'Rol base para médicos',
        esRolSistema: true,
        permisos: [
          'HORARIOS_CONFIGURAR', 'CITAS_VER', 'CITAS_ATENDER', 'CONSULTAS_MEDICAS',
          'HISTORIAL_VER', 'HISTORIAL_CREAR_EVOLUCION', 'HISTORIAL_ADJUNTAR_DOCUMENTOS',
          'TAREAS_CREAR', 'FARMACIA_RECETAR', 'FARMACIA_SOLICITAR'
        ]
      },
      {
        nombre: 'Enfermero',
        descripcion: 'Rol base para enfermería',
        esRolSistema: true,
        permisos: [
          'CITAS_VER', 'HISTORIAL_VER', 'HISTORIAL_ADJUNTAR_DOCUMENTOS', 
          'TAREAS_EJECUTAR', 'TAREAS_AUDITAR'
        ]
      },
      {
        nombre: 'Paciente',
        descripcion: 'Rol base para pacientes',
        esRolSistema: true,
        permisos: ['CITAS_VER', 'CITAS_AGENDAR', 'CITAS_REPROGRAMAR_CANCELAR', 'HISTORIAL_VER']
      },
      {
        nombre: 'Recepcionista',
        descripcion: 'Rol base para recepción',
        esRolSistema: true,
        permisos: ['HORARIOS_CONFIGURAR', 'CITAS_VER', 'CITAS_AGENDAR', 'CITAS_REPROGRAMAR_CANCELAR', 'PACIENTES_REGISTRAR']
      }
    ];

    let adminRolId = null;

    for (const rolData of rolesBase) {
      let rol = await Rol.findOne({ nombre: rolData.nombre });
      if (!rol) {
        rol = new Rol(rolData);
        await rol.save();
        console.log(`[Seeder] Rol creado: ${rol.nombre}`);
      }
      
      if (rol.nombre === 'Administrador') {
        adminRolId = rol._id;
      }
    }

    // 2. Sembrar Administrador si no existe
    if (adminRolId) {
      const adminExists = await Usuario.findOne({ email: 'admin@clinica.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);

        const newAdmin = new Usuario({
          nombre: 'Super',
          apellido: 'Administrador',
          ci: '000000000',
          email: 'admin@clinica.com',
          password: hashedPassword,
          rolId: adminRolId
        });
        await newAdmin.save();
        console.log('[Seeder] Usuario Administrador creado con éxito (admin@clinica.com / admin)');
      } else if (!adminExists.rolId) {
        // Migración de emergencia si el admin viejo no tiene rolId
        adminExists.rolId = adminRolId;
        await adminExists.save();
        console.log('[Seeder] Usuario Administrador actualizado con rolId');
      }
    }

  } catch (error) {
    console.error('[Seeder Error] Fallo al sembrar roles y admin:', error);
  }
};

module.exports = { seedRolesAndAdmin, PERMISOS_SISTEMA };
