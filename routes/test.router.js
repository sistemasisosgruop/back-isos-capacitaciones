const {Router} = require('express');

const {models} = require('../libs/sequelize')
const router = Router();

router.get('/', async(req, res, next)=>{
    try {
        const tests = await models.Test.findAll({
          include: ['Empresas']
        });
        
        res.json(tests)
    } catch (error) {
        next(error);
    }
})

router.get('/:id', async (req,res, next)=>{
    try {
        const {id} = req.params;
        const tes = await models.Test.findByPk(id,{
          include: ['Empresas']
        });
        res.json(tes)
    } catch (error) {
        next(error)        
    }
})

router.post('/', async (req, res) => {
    const { detalle, urlTest, fechaCr, fechaVen, empresas } = req.body;
  
    try {
      // Crear el Test en la base de datos
      const nuevoTest = await models.Test.create({ 
        detalle, urlTest, fechaCr, fechaVen, empresaId: empresas[0] 
      });
  
      // Asociar cada empresa especificada en el cuerpo de la solicitud con el nuevo Test
      const empresasArray = Array.isArray(empresas) ? empresas : [empresas];
      await Promise.all(empresasArray.map(empresaId => nuevoTest.addEmpresa(empresaId)));
  
      // Responder con el Test creado y sus empresas asociadas
      const testConEmpresas = await models.Test.findOne({
        where: { id: nuevoTest.id },
        include: { model: models.Empresa },
      });
      res.json(testConEmpresas);
    } catch (error) {
      console.error(error);
      res.status(500).send('Ha ocurrido un error al crear el Test');
    }
});

router.patch('/:id', async(req,res,next)=>{
    const {id} = req.params;
    
    try {
      const tes = await models.Test.findByPk(id);
      if (!tes) {
        return res.status(404).json({message: 'No existe el test'})
      }   

      const { detalle, codigo, urlTest, fechaCr, fechaVen, fechaAplazo } = req.body;
      await tes.update({
        detalle: detalle ?? tes.detalle,
        codigo: codigo ?? tes.codigo,
        urlTest: urlTest ?? tes.urlTest,
        fechaCr: fechaCr ?? tes.fechaCr,
        fechaVen: fechaVen ?? tes.fechaVen,
        fechaAplazo: fechaAplazo ?? tes.fechaAplazo
      })
      const empresasActuales = await tes.getEmpresas();
  
      if (req.body.empresas) {
        const nuevasEmpresas = req.body.empresas ? Array.isArray(req.body.empresas) ? req.body.empresas : [req.body.empresas] : [];
        const empresasAEliminar = empresasActuales.filter(empresa => !nuevasEmpresas.includes(empresa.id));
        const empresasAAgregar = nuevasEmpresas.filter(empresa => !empresasActuales.map(e => e.id).includes(empresa));
        const elimina = await Promise.all(empresasAEliminar.map(empresa => tes.removeEmpresa(empresa)));
        const add = await Promise.all(empresasAAgregar.map(empresaId => tes.addEmpresa(empresaId)));
          
      }
      res.status(200).json(tes)
      

    } catch (error) {
      res.status(500).json({message: 'Error al actualizar tests'})
    }

})


router.delete('/:id', async(req,res,next)=>{
  const {id} = req.params;
  try {
    const tes = await models.Test.findByPk(id);
    if (!tes) {
      return res.status(404).json({message: 'No existe el test'})
    }   

    await models.TestEmpresa.destroy({
      where:{
        test_id: tes.id
      }
    })

    await tes.destroy()
    res.status(201).json({message: 'Eliminado', test: tes})
    

  } catch (error) {
    res.status(500).json({message: 'Error al eliminar tests'})
  }

})

module.exports = router