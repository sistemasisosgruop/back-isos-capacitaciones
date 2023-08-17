const boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Op } = require("sequelize");

const { models } = require("./../libs/sequelize");

class TrabajadorService {
  constructor() {}

  async create(data) {
    const hash = await bcrypt.hash(data.user.contraseña, 10);
    console.log(data);
    const nuevoData = {
      ...data,
      user: {
        ...data.user,
        celular: data.user.celular,
        contraseña: hash,
      },
    };
    const comprobarUsuario = await models.Usuario.findOne({
      where: { username: nuevoData.user.username },
    });
    if (!comprobarUsuario) {
      const nuevotrabajador = await models.Trabajador.create(nuevoData, {
        include: ["user"],
      });

      delete nuevotrabajador.dataValues.user.dataValues.password;
      
      return nuevotrabajador;
    } else {
      return false;
    }
  }

  async createExcel(datos, empreId) {
    const dnisSet = new Set(); // Conjunto para almacenar los DNIs
    datos = datos
      .map((objeto) => {
        const dniData = objeto.DNI ? objeto.DNI.toString() : undefined;

        if (dniData && dnisSet.has(dniData)) {
          console.log(`DNI duplicado encontrado: ${dniData}`);
          return null;
        }

        dnisSet.add(dniData); // Agrega el DNI al conjunto
        const nombres = objeto.NOMBRES ? objeto.NOMBRES : "corregir nombre";
        const apellidoPaterno = objeto["APELLIDO PATERNO"]
          ? objeto["APELLIDO PATERNO"]
          : "corregir apellido";
        const apellidoMaterno = objeto["APELLIDO  MATERNO"]
          ? objeto["APELLIDO  MATERNO"]
          : "corregir apellido";
        const dni = objeto.DNI ? objeto.DNI.toString() : undefined;
        const celular = objeto.CELULAR
          ? objeto.CELULAR.toString().slice(0, 9)
          : "corregir celular";
        const genero = objeto["SEXO (F/M)"]
          ? objeto["SEXO (F/M)"]
          : "corregir sexo";
        const edad = objeto.EDAD ? parseInt(objeto.EDAD) : 0;
        const areadetrabajo = objeto["Tipo de trabajo"]
          ? objeto["Tipo de trabajo"]
          : "corregir tipo de trabajo";
        const cargo = objeto.CARGO ? objeto.CARGO : "corregir cargo";
        const fechadenaci = objeto["FECHA DE NACIMIENTO"]
          ? objeto["FECHA DE NACIMIENTO"]
          : "01/01/2000";
        const fechadenac = moment(fechadenaci, [
          "DD/MM/YYYY",
          "YYYY-MM-DD",
        ]).format("YYYY-MM-DD");
        const username = dni;
        const contraseña = objeto.CONTRASEÑA ? objeto.CONTRASEÑA : username;
        const newUser = { username, contraseña };
        const empresaId = empreId;
        return {
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          dni,
          genero,
          edad,
          areadetrabajo,
          cargo,
          fechadenac,
          user: newUser,
          empresaId,
          celular,
        };
      })
      .filter((objeto) => objeto !== null);
      const dnis = datos.map(item => item.dni)
      const existenTrabajadores = await models.Trabajador.findAll({where:{dni: dnis}});
      const existenUsuarios = await models.Trabajador.findAll({where:{dni: dnis}});
    const trabajadoresNuevos = [];
    let usuario;
    for (const trabajadorData of datos) {
      const trabajadorExistente = await this.findByDni(trabajadorData.dni);
      const usuarioExistente = await models.Usuario.findOne({
        where: { username: trabajadorData.user.username.toString() },
      });
      const hashedPassword = await bcrypt.hash(
        trabajadorData.user.contraseña,
        10
      );

      if (!usuarioExistente) {
        usuario = await models.Usuario.create({
          ...trabajadorData.user,
          contraseña: hashedPassword,
        });
        trabajadorData.userId = usuario.id;
      } else {
        trabajadorData.userId = usuarioExistente.id;
      }

      if (!trabajadorExistente) {
        trabajadoresNuevos.push(trabajadorData);
      } else {
        // Actualizamos los datos del trabajador existente
        trabajadorExistente.update(trabajadorData);
      }
    }

    // Ahora, procedemos a crear los trabajadores.
    if (trabajadoresNuevos.length > 0) {
      try {
        const trabajadores = await models.Trabajador.bulkCreate(
          trabajadoresNuevos,
          {
            updateOnDuplicate: [
              "nombres",
              "apellidoPaterno",
              "apellidoMaterno",
              "genero",
              "edad",
              "areadetrabajo",
              "cargo",
              "fechadenac",
              "celular",
            ],
          }
        );
        return trabajadores;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  async find() {
    const trabajadores = await models.Trabajador.aggregate("id", "DISTINCT", {
      plain: false,
    });
    const trabajadoresIds = trabajadores.map(
      (trabajador) => trabajador.DISTINCT
    );
    const trabajadoresUnicos = await models.Trabajador.findAll({
      where: {
        id: {
          [Op.in]: trabajadoresIds,
        },
      },
      include: ["user", "empresa"],
    });

    const trabajadoresUnicosSinDuplicados = trabajadoresUnicos.reduce(
      (lista, trabajador) => {
        const existe = lista.some((t) => t.id === trabajador.id);
        if (!existe) {
          lista.push(trabajador);
        }
        return lista;
      },
      []
    );

    return trabajadoresUnicosSinDuplicados;
  }

  async findByDni(dni) {

    try {
      const trabajador = await models.Trabajador.findOne({
        where: { dni },
        include: ["user", "empresa"],
      });
      console.log(trabajador);
      return trabajador;
    } catch (error) {
      console.log(error);
    }

  }

  async findOne(id) {
    const trabajador = await models.Trabajador.findByPk(id, {
      include: ["user", "empresa"],
    });
    if (!trabajador) {
      throw boom.notFound("Trabajador no encontrado");
    }
    return trabajador;
  }

  async update(id, changes) {
    const trabajador = await this.findOne(id);
    const userChanges = changes.user || {};
    const dniChanged = changes.dni !== undefined && changes.dni !== trabajador.dni;
    const respuestaTrabajador = await trabajador.update({
      nombres: changes.nombres ?? trabajador.nombres,
      apellidoPaterno: changes.apellidoPaterno ?? trabajador.apellidoPaterno,
      apellidoMaterno: changes.apellidoMaterno ?? trabajador.apellidoMaterno,
      dni: changes.dni ?? trabajador.dni,
      genero: changes.genero ?? trabajador.genero,
      edad: changes.edad ?? trabajador.edad,
      fechadenac: changes.fechadenac ?? trabajador.fechadenac,
      areadetrabajo: changes.areadetrabajo ?? trabajador.areadetrabajo,
      cargo: changes.cargo ?? trabajador.cargo,
      habilitado: changes.habilitado ?? trabajador.habilitado,
      celular: changes.celular ?? trabajador.celular,
      empresaId: changes.empresaId ?? trabajador.empresa_id
    });

    if (dniChanged) {
      // Actualizar trabajadorId en la tabla emo si el DNI cambió
      await this.actualizarTrabajadorIdEnEmo(trabajador.id, changes.dni);
    }

    if (userChanges.username || userChanges.contraseña || userChanges.rol) {
      const user = await trabajador.getUser();
      const hash = await bcrypt.hash(userChanges.contraseña, 10);

      const respuestaUsuario = await user.update({
        username: userChanges.username ?? user.username,
        contraseña: hash ?? user.contraseña,
        rol: userChanges.rol ?? user.rol,
      });
    }
    return respuestaTrabajador;
  }

  async actualizarTrabajadorIdEnEmo(trabajadorId, nuevoDNI) {
    try {
      // Buscar el registro de emo asociado al trabajadorId
      const emoRegistro = await models.Emo.findAll({ where: { trabajadorId: trabajadorId } });
  
      if (emoRegistro) {
        // Actualizar el campo trabajadorId en el registro de emo
        await emoRegistro.update({ dni: nuevoDNI });
        return true; // Indicar que la actualización se realizó con éxito
      } else {
        return false; // Indicar que no se encontró el registro de emo
      }
    } catch (error) {
      console.error("Error al actualizar trabajadorId en la tabla emo:", error);
      throw error;
    }
  }
  

  async delete(id) {
    const trabajador = await this.findOne(id);
    const usuario = await trabajador.getUser();
    await Promise.all([trabajador.destroy(), usuario.destroy()]);
    return { id };
  }
}

module.exports = TrabajadorService;
