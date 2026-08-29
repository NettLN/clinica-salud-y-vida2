const HorarioAtencion = require('../models/HorarioAtencion');

const getHorariosMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;
    const horarios = await HorarioAtencion.find({ medicoId }).sort({ diaSemana: 1 });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const guardarHorario = async (req, res) => {
  try {
    const { medicoId, diaSemana, horaInicio, horaFin, activo } = req.body;
    let horario = await HorarioAtencion.findOne({ medicoId, diaSemana });
    
    if (horario) {
      horario.horaInicio = horaInicio;
      horario.horaFin = horaFin;
      horario.activo = activo;
    } else {
      horario = new HorarioAtencion({ medicoId, diaSemana, horaInicio, horaFin, activo });
    }
    
    await horario.save();
    res.json(horario);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    await HorarioAtencion.findByIdAndDelete(id);
    res.json({ message: 'Horario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar horario' });
  }
};

module.exports = { getHorariosMedico, guardarHorario, deleteHorario };
