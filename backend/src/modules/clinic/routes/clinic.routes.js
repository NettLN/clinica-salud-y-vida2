const express = require('express');
const router = express.Router();
const citaController = require('../controllers/cita.controller');
const horarioController = require('../controllers/horario.controller');
const evolucionController = require('../controllers/evolucion.controller');

// Rutas de Citas
router.get('/citas/disponibilidad', citaController.obtenerDisponibilidadMedico);
router.post('/citas', citaController.crearCita);
router.put('/citas/:id/cancelar', citaController.cancelarCita); // Soft delete
router.put('/citas/:id/reprogramar', citaController.reprogramarCita);
router.get('/citas/paciente/:pacienteId', citaController.obtenerCitasPaciente);
router.get('/citas/medico/:medicoId', citaController.obtenerCitasMedico);

// Rutas de Horarios
router.get('/horarios/:medicoId', horarioController.getHorariosMedico);
router.post('/horarios', horarioController.guardarHorario);
router.delete('/horarios/:id', horarioController.deleteHorario);

// Rutas de Evoluciones
router.get('/evoluciones/paciente/:pacienteId', evolucionController.getEvolucionesPaciente);
router.post('/evoluciones', evolucionController.crearEvolucion);

module.exports = router;
