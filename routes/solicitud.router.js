const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_GMAIL_ENV,
    pass: process.env.PASS_GMAIL_ENV
  }
});

router.post('/sendSolicitud', async (req, res, next) => {
    try {
      const body = req.body;
      
      let mailOption = {
        from: process.env.USER_GMAIL_ENV, //
        to: body.correo,
        subject: 'Solicitud de Soporte Técnico',
        html: `
          <h3>Nueva Solicitud de Soporte</h3>
          <p><strong>Nombre:</strong> ${body.nombre}</p>
          <p><strong>DNI:</strong> ${body.dni}</p>
          <p><strong>Teléfono:</strong> ${body.telefono}</p>
          <p><strong>Empresa:</strong> ${body.empresa.label}</p>
          <p><strong>Mensaje:</strong> ${body.mensaje}</p>
          <br>
          <p>Nos pondremos en contacto con usted lo antes posible.</p>
        `,
        attachments: body.captura ? [
          {
            filename: 'captura.png',
            content: body.captura.split(';base64,').pop(),
            encoding: 'base64'
          }
        ] : []
      };

      // Enviar el correo de forma asíncrona usando promesas
      try {
        const info = await transporter.sendMail(mailOption);
        console.log('Email enviado correctamente a ' + mailOption.to);
        res.status(200).json({ 
          message: "Solicitud enviada correctamente",
          info: info
        });
      } catch (emailError) {
        console.log('Error al enviar email:', emailError);
        res.status(500).json({ error: 'Error al enviar el email' });
      }
  
    } catch (error) {
      next(error);
    }
});

module.exports = router;