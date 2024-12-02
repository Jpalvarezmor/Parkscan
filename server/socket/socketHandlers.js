// socket/socketHandlers.js
module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('Usuario conectado:', socket.id);
  
      socket.on('requestPayment', (data) => {
        // Emitir evento de pago a un usuario específico o hacer el manejo necesario
        socket.to(data.usuarioId).emit('requestPayment', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
      });
    });
  };
  