const Medicamento = require('../models/Medicamento');
const LoteMedicamento = require('../models/LoteMedicamento');
const SolicitudMedicamento = require('../models/SolicitudMedicamento');
const RecetaMedica = require('../models/RecetaMedica');
const mongoose = require('mongoose');

// ==========================================
// 1. OBTENER INVENTARIO CON CÁLCULO DE STOCK EN VIVO
// ==========================================
const getInventario = async (req, res) => {
  try {
    const medicamentos = await Medicamento.find();
    const inventarioFinal = [];

    for (let med of medicamentos) {
      // Buscar lotes activos
      const lotesActivos = await LoteMedicamento.find({ 
        medicamentoId: med._id, 
        estado: 'Activo' 
      }).sort({ fechaVencimiento: 1 }); // Ordenamos por el que vence más pronto (FEFO)

      const stockTotal = lotesActivos.reduce((acc, lote) => acc + lote.cantidadActual, 0);
      
      // Fecha del próximo a vencer para alertas
      const proxVencimiento = lotesActivos.length > 0 ? lotesActivos[0].fechaVencimiento : null;
      const lotePrincipal = lotesActivos.length > 0 ? lotesActivos[0].numeroLote : 'Sin Lote Activo';

      inventarioFinal.push({
        _id: med._id,
        nombre: med.nombreComercial,
        principioActivo: med.principioActivo,
        lote: lotePrincipal, // Muestra el lote prioritario a salir
        stock: stockTotal,
        minStock: med.stockMinimo,
        fechaVenc: proxVencimiento,
        precioUnitario: med.precioUnitario || 0
      });
    }

    res.json(inventarioFinal);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventario' });
  }
};

const createMedicamento = async (req, res) => {
  const { nombreComercial, principioActivo, precioUnitario, stockMinimo, cantidadInicial, fechaVencimiento } = req.body;
  try {
    let med = await Medicamento.findOne({ nombreComercial });
    if (!med) {
      med = new Medicamento({ nombreComercial, principioActivo, precioUnitario, stockMinimo });
      await med.save();
    }
    
    const nuevoLote = new LoteMedicamento({
      medicamentoId: med._id,
      numeroLote: `L-MANUAL-${Date.now().toString().slice(-4)}`,
      cantidadActual: cantidadInicial,
      fechaVencimiento: new Date(fechaVencimiento)
    });
    await nuevoLote.save();

    res.json({ message: 'Medicamento/Lote registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar lote' });
  }
};

const deleteMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    // Eliminamos lotes primero
    await LoteMedicamento.deleteMany({ medicamentoId: id });
    await Medicamento.findByIdAndDelete(id);
    res.json({ message: 'Medicamento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar medicamento' });
  }
};

// ==========================================
// 2. GESTIÓN DE SOLICITUDES MÉDICAS
// ==========================================
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudMedicamento.find()
      .populate('medicoId', 'nombre apellido especialidad')
      .populate('medicamentoId', 'nombreComercial');
    
    // Formatear para el frontend
    const format = solicitudes.map(s => ({
      id: s._id,
      medico: `Dr. ${s.medicoId.apellido} (${s.medicoId.especialidad})`,
      medicamento: s.medicamentoId.nombreComercial,
      cantidad: s.cantidadSugerida,
      motivo: s.motivo,
      estado: s.estado
    }));
    res.json(format);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar solicitudes' });
  }
};

const procesarSolicitud = async (req, res) => {
  const { id } = req.params;
  const { accion } = req.body; // 'Aprobar' o 'Rechazar'

  try {
    const solicitud = await SolicitudMedicamento.findById(id);
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    if (accion === 'Aprobar') {
      solicitud.estado = 'Aprobada';
      // Crear un lote automáticamente tras aprobar
      const nuevoLote = new LoteMedicamento({
        medicamentoId: solicitud.medicamentoId,
        numeroLote: `L-AUTO-${Date.now().toString().slice(-4)}`,
        cantidadActual: solicitud.cantidadSugerida,
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 2)) // Vence en 2 años por defecto
      });
      await nuevoLote.save();
    } else {
      solicitud.estado = 'Rechazada';
    }

    await solicitud.save();
    res.json({ message: `Solicitud ${accion}` });
  } catch (error) {
    res.status(500).json({ message: 'Error procesando solicitud' });
  }
};

// ==========================================
// 3. ALGORITMO FEFO: PROCESAR PAGO DE RECETA
// ==========================================
const procesarPagoReceta = async (req, res) => {
  const { recetaId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receta = await RecetaMedica.findById(recetaId).session(session);
    if (!receta || receta.estadoPago === 'Pagado') {
      throw new Error('Receta inválida o ya pagada');
    }

    // Iterar sobre cada medicamento de la receta
    for (let item of receta.medicamentos) {
      let faltante = item.cantidadRecetada;

      // Buscar todos los lotes activos de este medicamento ordenados por vencimiento (FEFO)
      const lotes = await LoteMedicamento.find({ 
        medicamentoId: item.medicamentoId, 
        estado: 'Activo' 
      }).sort({ fechaVencimiento: 1 }).session(session);

      for (let lote of lotes) {
        if (faltante <= 0) break; // Ya cubrimos la necesidad

        if (lote.cantidadActual >= faltante) {
          lote.cantidadActual -= faltante;
          faltante = 0;
        } else {
          // Si el lote tiene menos de lo que necesitamos, nos lo terminamos todo
          faltante -= lote.cantidadActual;
          lote.cantidadActual = 0;
        }

        // Si se agotó el lote, cambiar estado
        if (lote.cantidadActual === 0) lote.estado = 'Agotado';
        
        await lote.save({ session });
      }

      if (faltante > 0) {
        throw new Error(`Stock insuficiente para descontar. Faltan ${faltante} unidades.`);
      }
    }

    receta.estadoPago = 'Pagado';
    await receta.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Pago procesado exitosamente y stock descontado (Algoritmo FEFO)' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInventario, createMedicamento, deleteMedicamento, getSolicitudes, procesarSolicitud, procesarPagoReceta };
