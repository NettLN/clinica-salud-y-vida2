const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');

// Rutas de Tareas de Enfermería
router.post('/tareas', tareaController.crearTarea);
router.get('/tareas/medico/:medicoId', tareaController.getTareasPorMedico);
router.put('/tareas/:id/auditar', tareaController.auditarTarea);

router.get('/tareas/enfermero/:enfermeroId', tareaController.getTareasEnfermeria);
router.put('/tareas/:id/tomar', tareaController.tomarTarea);
router.put('/tareas/:id/finalizar', tareaController.finalizarTarea);

module.exports = router;
