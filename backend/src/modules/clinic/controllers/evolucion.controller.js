const EvolucionMedica = require('../models/EvolucionMedica');
const HistorialClinico = require('../models/HistorialClinico');
const Cita = require('../models/Cita');

const getEvolucionesPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    let historial = await HistorialClinico.findOne({ pacienteId });
    if (!historial) {
      // Crear historial si no existe
      historial = new HistorialClinico({ pacienteId });
      await historial.save();
    }
    
    const evoluciones = await EvolucionMedica.find({ historialClinicoId: historial._id })
      .populate('medicoId', 'nombre apellido especialidad')
      .populate({
        path: 'recetaId',
        populate: { path: 'medicamentos.medicamentoId' }
      })
      .sort({ fechaHora: -1 });
      
    res.json(evoluciones);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const crearEvolucion = async (req, res) => {
  try {
    const { pacienteId, medicoId, citaId, asunto, sintomas, descripcion, recetaId } = req.body;
    
    let historial = await HistorialClinico.findOne({ pacienteId });
    if (!historial) {
      historial = new HistorialClinico({ pacienteId });
      await historial.save();
    }

    const nuevaEvolucion = new EvolucionMedica({
      historialClinicoId: historial._id,
      medicoId,
      citaId,
      asunto,
      sintomas,
      descripcion,
      recetaId
    });

    await nuevaEvolucion.save();
    
    if (citaId) {
      await Cita.findByIdAndUpdate(citaId, { estado: 'Atendida' });
    }

    res.status(201).json(nuevaEvolucion);
  } catch (error) {
<<<<<<< HEAD
    console.error('Error en crearEvolucion:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
=======
    res.status(500).json({ message: 'Error en el servidor' });
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
  }
};

module.exports = { getEvolucionesPaciente, crearEvolucion };
