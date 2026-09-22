const cron = require('node-cron');
const Cita = require('../modules/clinic/models/Cita');
const TareaEnfermeria = require('../modules/nursing/models/TareaEnfermeria');
const io = require('../config/socket'); // Instancia de Socket.io
const { sendNotification } = require('../utils/notifications');

const initCronJobs = () => {

  // 1. Tareas de Enfermería: Se ejecuta CADA MINUTO
  cron.schedule('* * * * *', async () => {
    try {
      const ahora = new Date();
      
      // Buscar tareas asignadas y en progreso que hayan excedido su tiempo límite
      const tareasExpiradas = await TareaEnfermeria.find({
        estado: { $in: ['Pendiente_Asignada', 'En_Progreso'] },
        plazoLimite: { $lt: ahora }
      });

      if (tareasExpiradas.length > 0) {
        for (let tarea of tareasExpiradas) {
          tarea.estado = 'Pendiente_General';
          tarea.enfermeroEjecutor = null;
          tarea.tipo = 'General'; // Retorna al pool general de enfermería
          await tarea.save();
        }
        
        // Emitir evento en tiempo real para actualizar las vistas de las enfermeras conectadas
        io.emit('tareas_pool_actualizado', { message: 'Nuevas tareas retornadas al pool general' });
        console.log(`[Cron] ${tareasExpiradas.length} tareas expiradas retornadas al pool.`);
      }
    } catch (error) {
      console.error('[Cron Error] Tareas de enfermería:', error);
    }
  });

  // 2. Notificaciones de Citas: Se ejecuta CADA HORA
  cron.schedule('0 * * * *', async () => {
    try {
      const ahora = new Date();
      
      // Rango para notificaciones de 24 horas
      const inicio24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      const fin24h = new Date(inicio24h.getTime() + 60 * 60 * 1000);

      // Rango para notificaciones de 2 horas
      const inicio2h = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
      const fin2h = new Date(inicio2h.getTime() + 60 * 60 * 1000);

      const [citas24h, citas2h] = await Promise.all([
        Cita.find({ estado: 'Confirmada', fecha: { $gte: inicio24h, $lt: fin24h } }).populate('pacienteId'),
        Cita.find({ estado: 'Confirmada', fecha: { $gte: inicio2h, $lt: fin2h } }).populate('pacienteId')
      ]);

      // Enviar alertas 24h
      citas24h.forEach(cita => {
        sendNotification(
          cita.pacienteId.email, 
          cita.pacienteId.telefono, 
          'Recordatorio 24h: Su cita médica en Salud y Vida'
        );
      });

      // Enviar alertas 2h
      citas2h.forEach(cita => {
        sendNotification(
          cita.pacienteId.email, 
          cita.pacienteId.telefono, 
          'Recordatorio 2h: Su cita médica está próxima a iniciar'
        );
      });

    } catch (error) {
      console.error('[Cron Error] Notificaciones de citas:', error);
    }
  });
};

module.exports = initCronJobs;
