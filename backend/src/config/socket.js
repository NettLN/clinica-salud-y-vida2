let ioInstance;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    ioInstance = new Server(httpServer, {
      cors: {
        origin: '*', // En producción limitar
      },
    });
    return ioInstance;
  },
  getIO: () => {
    if (!ioInstance) {
      throw new Error('Socket.io no ha sido inicializado.');
    }
    return ioInstance;
  },
  emit: (event, data) => {
    if (ioInstance) {
      ioInstance.emit(event, data);
    }
  }
};
