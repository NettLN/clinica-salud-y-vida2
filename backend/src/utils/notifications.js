const sendNotification = (email, telefono, mensaje) => {
  // Aquí iría la integración con Nodemailer o Twilio
  console.log(`[NOTIFICACIÓN ENVIADA] - A: ${email} / ${telefono} | Mensaje: ${mensaje}`);
};

module.exports = { sendNotification };
