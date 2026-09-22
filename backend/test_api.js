const http = require('http');

const run = async () => {
  try {
    const evoRes = await fetch('http://localhost:5000/api/clinic/evoluciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteId: '654321654321654321654321', // dummy
        medicoId: '654321654321654321654321', // dummy
        asunto: 'Test Asunto',
        sintomas: 'Test Sintomas',
        descripcion: 'Test Descripcion'
      })
    });
    const evoText = await evoRes.text();
    console.log("Evo Res:", evoRes.status, evoText);

  } catch (e) {
    console.error(e);
  }
};

run();
