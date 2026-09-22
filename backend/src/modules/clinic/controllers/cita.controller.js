const Cita = require('../models/Cita');
const HorarioAtencion = require('../models/HorarioAtencion');

const moment = require('moment');

// Obtener los horarios de atención y las citas ocupadas, y generar bloques disponibles de 30 min.
const obtenerDisponibilidadMedico = async (req, res) => {
  try {
    const { medicoId, fecha } = req.query; // fecha en formato "YYYY-MM-DD"
    if (!medicoId || !fecha) {
      return res.status(400).json({ message: 'medicoId y fecha son requeridos' });
    }

    const diaSemana = moment(fecha).day(); // 0-6
    const horarioAtencion = await HorarioAtencion.findOne({ medicoId, diaSemana, activo: true });

    if (!horarioAtencion) {
      return res.json({ cupos: [] }); // No atiende ese día
    }

    const citasOcupadas = await Cita.find({
      medicoId,
      fecha: new Date(fecha),
      estado: { $in: ['Pendiente', 'Atendida'] }
    });

    const horasOcupadas = citasOcupadas.map(cita => cita.hora);
    const cupos = [];
    let horaActual = moment(fecha + ' ' + horarioAtencion.horaInicio, "YYYY-MM-DD HH:mm");
    const horaFin = moment(fecha + ' ' + horarioAtencion.horaFin, "YYYY-MM-DD HH:mm");

    while (horaActual < horaFin) {
      const horaString = horaActual.format("HH:mm");
      if (!horasOcupadas.includes(horaString)) {
        cupos.push(horaString);
      }
      horaActual.add(horarioAtencion.duracionCitaMinutos, 'minutes');
    }

    res.json({ cupos });
  } catch (error) {
    console.error("Error generando cupos:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const crearCita = async (req, res) => {
  try {
    const { pacienteId, medicoId, fecha, hora, sintomasPrevios } = req.body;
    
    // Verificar si ya hay una cita en ese horario por si hubo concurrencia
    const existente = await Cita.findOne({
      medicoId,
      fecha: new Date(fecha),
      hora,
      estado: { $in: ['Pendiente', 'Atendida'] }
    });

    if (existente) {
      return res.status(400).json({ message: 'El cupo ya no está disponible' });
    }

    const nuevaCita = new Cita({
      pacienteId,
      medicoId,
      fecha: new Date(fecha),
      hora,
      sintomasPrevios,
      estado: 'Pendiente',
      fechaReprogramacionMax: moment(fecha).add(3, 'days').toDate()
    });

    await nuevaCita.save();
    res.status(201).json({ message: 'Cita reservada con éxito', cita: nuevaCita });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { canceladoPor } = req.body; // 'Paciente' o 'Medico'

    const cita = await Cita.findById(id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    cita.estado = canceladoPor === 'Medico' ? 'Cancelada_Medico' : 'Cancelada_Paciente';
    await cita.save();

    res.json({ message: 'Cita cancelada correctamente', cita });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const reprogramarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaFecha, nuevaHora } = req.body;

    const cita = await Cita.findById(id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    if (moment(nuevaFecha).isAfter(moment(cita.fechaReprogramacionMax))) {
      return res.status(400).json({ message: 'La nueva fecha supera el límite de 3 días permitido' });
    }

    // Agregar al historial de reprogramaciones
    cita.historialReprogramaciones.push({
      fechaAnterior: cita.fecha,
      horaAnterior: cita.hora
    });

    cita.fecha = new Date(nuevaFecha);
    cita.hora = nuevaHora;
    await cita.save();

    res.json({ message: 'Cita reprogramada con éxito', cita });
  } catch (error) {
    console.error("Error al reprogramar cita:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const obtenerCitasPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const citas = await Cita.find({ pacienteId }).populate('medicoId', 'nombre apellido especialidad').sort({ fecha: -1 });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const obtenerCitasMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;
    const citas = await Cita.find({ medicoId }).populate('pacienteId', 'nombre apellido').sort({ fecha: 1 });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  obtenerDisponibilidadMedico,
  crearCita,
  cancelarCita,
  reprogramarCita,
  obtenerCitasPaciente,
  obtenerCitasMedico
};
