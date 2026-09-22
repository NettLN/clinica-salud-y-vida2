const mongoose = require('mongoose');

const fixIndex = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/clinica_salud_vida');
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('historialclinicos');
    
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes);
    
    // Find index named 'paciente_1' or anything with 'paciente'
    for (let index of indexes) {
      if (index.name === 'paciente_1') {
        console.log('Dropping index paciente_1...');
        await collection.dropIndex('paciente_1');
        console.log('Dropped!');
      }
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fixIndex();
