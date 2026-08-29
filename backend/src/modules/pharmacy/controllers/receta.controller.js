const RecetaMedica = require('../models/RecetaMedica');
const LoteMedicamento = require('../models/LoteMedicamento');
const Medicamento = require('../models/Medicamento');

// FEFO: First Expire, First Out
const procesarEntregaReceta = async (req, res) => {
  try {
    const { id } = req.params; // ID de la receta

    const receta = await RecetaMedica.findById(id).populate('medicamentos.medicamentoId');
    if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

    if (receta.estadoEntrega === 'Entregado') {
      return res.status(400).json({ message: 'La receta ya fue entregada' });
    }

    if (receta.estadoPago === 'Pendiente') {
      return res.status(400).json({ message: 'La receta debe ser pagada antes de la entrega' });
    }

    // Para cada medicamento, aplicar FEFO
    for (let item of receta.medicamentos) {
      let cantidadFaltante = item.cantidad;

      // Buscar lotes activos ordenados por fecha de vencimiento (FEFO)
      const lotes = await LoteMedicamento.find({
        medicamentoId: item.medicamentoId._id,
        estado: 'Activo',
        fechaVencimiento: { $gt: new Date() } // Solo lotes no vencidos
      }).sort({ fechaVencimiento: 1 }); // Más próximo a vencer primero

      // Descontar la cantidad
      for (let lote of lotes) {
        if (cantidadFaltante <= 0) break;

        if (lote.cantidadActual >= cantidadFaltante) {
          lote.cantidadActual -= cantidadFaltante;
          cantidadFaltante = 0;
        } else {
          cantidadFaltante -= lote.cantidadActual;
          lote.cantidadActual = 0;
          lote.estado = 'Agotado';
        }
        await lote.save();
      }

      if (cantidadFaltante > 0) {
        // En una app real podríamos hacer rollback, pero aquí solo lanzamos error
        return res.status(400).json({ 
          message: `Stock insuficiente para el medicamento ${item.medicamentoId.nombreComercial}. Faltan ${cantidadFaltante} unidades.` 
        });
      }
    }

    receta.estadoEntrega = 'Entregado';
    await receta.save();

    res.json({ message: 'Receta entregada correctamente, inventario actualizado (FEFO)', receta });
  } catch (error) {
    console.error("Error al procesar receta:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const crearReceta = async (req, res) => {
  try {
    const nuevaReceta = new RecetaMedica(req.body);
    await nuevaReceta.save();
    res.status(201).json({ message: 'Receta creada', receta: nuevaReceta });
  } catch (error) {
    console.error("Error al crear receta:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

const obtenerRecetasPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const recetas = await RecetaMedica.find({ pacienteId })
      .populate('medicoId', 'nombre apellido especialidad')
      .populate('medicamentos.medicamentoId', 'nombreComercial presentacion');
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { procesarEntregaReceta, crearReceta, obtenerRecetasPaciente };
