const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { config } = require("./../config/config");
const { models } = require("../libs/sequelize");

/**
 * @swagger
 * api/v1/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [LOGIN]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               contraseña:
 *                 type: string
 *             required:
 *               - username
 *               - contraseña
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               anyOf:
 *                 - $ref: '#/components/schemas/LoginValidoWorker'
 *                 - $ref: '#/components/schemas/LoginValidoAdmin'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *     security: []
 */

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const jwtconfig = {
        expiresIn: "30m",
      };
      const payload = {
        sub: user.id,
        role: user.rol,
      };
      const token = jwt.sign(payload, config.jwtSecret, jwtconfig);
      console.log(user);
      if (user.rol === "Trabajador") {
        const worker = await models.Trabajador.findOne({
          where: { userId: user.id },
        });
        if (worker.habilitado === false) {
          return res.status(401).json({ message: "Usted está deshabilitado" });
        } else {
          const data = {
            ...user.toJSON(),
            dni: worker.dni,
          };
          res.json({
            user:data,
            token,
            worker,
          });
        }
      } else if (user.rol === "Administrador") {
        const admin = await models.Administrador.findOne({
          where: { userId: user.id },
        });

        res.json({
          user,
          token,
          admin,
        });
      } else if(user.rol === "Supervisor"){
        const supervisor = await models.Trabajador.findOne({
          where: { userId: user.id },
        });
        if(supervisor.habilitado === false){
          return res.status(401).json({ message: "Usted está deshabilitado" });
        }
        const userData = {...user.toJSON(), empresaId:supervisor.empresaId, dni: supervisor.dni}

        res.json({
          user:userData,
          token,
          supervisor,
        });
      } else if(user.rol === "Capacitador"){
        const capacitador = await models.Trabajador.findOne({
          where: { userId: user.id },
        });
        if(capacitador.habilitado === false){
          return res.status(401).json({ message: "Usted está deshabilitado" });
        }
        const userData = {...user.toJSON(), empresaId:capacitador.empresaId, dni: capacitador.dni}

        res.json({
          user:userData,
          token,
          capacitador,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/verify-token", (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // obtén el token del encabezado de autorización

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // verifica la validez del token

    res.status(200).json({ message: "Token válido" });
  } catch (err) {
    res
      .status(401)
      .json({ message: "Sesion no válida o ha expirado, ingresé de nuevp" });
  }
});

module.exports = router;
