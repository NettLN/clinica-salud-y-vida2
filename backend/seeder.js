const Medicamento = require('./src/modules/pharmacy/models/Medicamento');
const LoteMedicamento = require('./src/modules/pharmacy/models/LoteMedicamento');

const seedMedicamentos = async () => {
  try {
    const count = await Medicamento.countDocuments();
    if (count === 0) {
      console.log('[Seeder] Creando 10 medicamentos iniciales...');
      
      const medicamentosMock = [
<<<<<<< HEAD
        { nombreComercial: 'Paracetamol', principioActivo: 'Paracetamol 500mg', presentacion: 'Tableta', precioUnitario: 0.50, stockMinimo: 50 },
        { nombreComercial: 'Amoxicilina', principioActivo: 'Amoxicilina 500mg', presentacion: 'Cápsula', precioUnitario: 1.20, stockMinimo: 30 },
        { nombreComercial: 'Ibuprofeno', principioActivo: 'Ibuprofeno 400mg', presentacion: 'Tableta', precioUnitario: 0.80, stockMinimo: 40 },
        { nombreComercial: 'Omeprazol', principioActivo: 'Omeprazol 20mg', presentacion: 'Cápsula', precioUnitario: 2.00, stockMinimo: 20 },
        { nombreComercial: 'Losartán', principioActivo: 'Losartán Potásico 50mg', presentacion: 'Tableta', precioUnitario: 1.50, stockMinimo: 25 },
        { nombreComercial: 'Metformina', principioActivo: 'Metformina 850mg', presentacion: 'Tableta', precioUnitario: 0.90, stockMinimo: 45 },
        { nombreComercial: 'Aspirina', principioActivo: 'Ácido Acetilsalicílico 100mg', presentacion: 'Tableta', precioUnitario: 0.30, stockMinimo: 60 },
        { nombreComercial: 'Loratadina', principioActivo: 'Loratadina 10mg', presentacion: 'Tableta', precioUnitario: 1.10, stockMinimo: 15 },
        { nombreComercial: 'Diclofenaco', principioActivo: 'Diclofenaco 50mg', presentacion: 'Tableta', precioUnitario: 0.70, stockMinimo: 35 },
        { nombreComercial: 'Salbutamol', principioActivo: 'Salbutamol Inhalador', presentacion: 'Inhalador', precioUnitario: 5.00, stockMinimo: 10 }
=======
        { nombreComercial: 'Paracetamol', principioActivo: 'Paracetamol 500mg', precioUnitario: 0.50, stockMinimo: 50 },
        { nombreComercial: 'Amoxicilina', principioActivo: 'Amoxicilina 500mg', precioUnitario: 1.20, stockMinimo: 30 },
        { nombreComercial: 'Ibuprofeno', principioActivo: 'Ibuprofeno 400mg', precioUnitario: 0.80, stockMinimo: 40 },
        { nombreComercial: 'Omeprazol', principioActivo: 'Omeprazol 20mg', precioUnitario: 2.00, stockMinimo: 20 },
        { nombreComercial: 'Losartán', principioActivo: 'Losartán Potásico 50mg', precioUnitario: 1.50, stockMinimo: 25 },
        { nombreComercial: 'Metformina', principioActivo: 'Metformina 850mg', precioUnitario: 0.90, stockMinimo: 45 },
        { nombreComercial: 'Aspirina', principioActivo: 'Ácido Acetilsalicílico 100mg', precioUnitario: 0.30, stockMinimo: 60 },
        { nombreComercial: 'Loratadina', principioActivo: 'Loratadina 10mg', precioUnitario: 1.10, stockMinimo: 15 },
        { nombreComercial: 'Diclofenaco', principioActivo: 'Diclofenaco 50mg', precioUnitario: 0.70, stockMinimo: 35 },
        { nombreComercial: 'Salbutamol', principioActivo: 'Salbutamol Inhalador', precioUnitario: 5.00, stockMinimo: 10 }
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
      ];

      for (let m of medicamentosMock) {
        const medGuardado = await new Medicamento(m).save();
        
        // Crear un lote inicial para cada medicamento (con diferentes estados para probar)
        const hoy = new Date();
        const diasExtra = Math.floor(Math.random() * 800) - 100; // Algunos vencerán pronto o ya vencieron
        const vence = new Date(hoy.setDate(hoy.getDate() + diasExtra));
        
        await new LoteMedicamento({
          medicamentoId: medGuardado._id,
          numeroLote: `L-${Math.floor(Math.random() * 9000) + 1000}`,
          cantidadActual: Math.floor(Math.random() * 100) + 1, // 1 a 100
          fechaVencimiento: vence,
          estado: vence < new Date() ? 'Vencido' : 'Activo'
        }).save();
      }

      console.log('[Seeder] 10 Medicamentos y sus Lotes inyectados en MongoDB');
    }
  } catch (error) {
    console.error('[Seeder Error] Fallo al sembrar medicamentos:', error);
  }
};

module.exports = seedMedicamentos;
