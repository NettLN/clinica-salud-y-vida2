const express = require('express');
const router = express.Router();
const { getInventario, createMedicamento, deleteMedicamento, getSolicitudes, procesarSolicitud, procesarPagoReceta } = require('../controllers/pharmacy.controller');
const recetaController = require('../controllers/receta.controller');
const { authMiddleware, roleMiddleware } = require('../../../middleware/auth.middleware');

router.use(authMiddleware);

// Rutas
router.get('/inventario', roleMiddleware(['Administrador', 'Medico']), getInventario);
router.post('/inventario', roleMiddleware(['Administrador']), createMedicamento);
router.delete('/inventario/:id', roleMiddleware(['Administrador']), deleteMedicamento);

router.get('/solicitudes', roleMiddleware(['Administrador']), getSolicitudes);
router.put('/solicitudes/:id', roleMiddleware(['Administrador']), procesarSolicitud);

// Ruta para pagos (Podría usarlo el Paciente o Recepcionista)
router.post('/recetas/:recetaId/pagar', procesarPagoReceta);

// Rutas de Recetas (FEFO)
router.get('/recetas/paciente/:pacienteId', recetaController.obtenerRecetasPaciente);
router.post('/recetas', recetaController.crearReceta);
router.put('/recetas/:id/entregar', recetaController.procesarEntregaReceta);

module.exports = router;
