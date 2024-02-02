const express = require('express');
const router = express.Router();
const db = require('../bd/conexionbd');

router.post('/InsertarCuentaPersona_web', (req, res) => {
  const { p_usuario, p_contrasenia, p_rut, p_dv, p_nombre, p_apellido, p_correo, p_token } = req.body;
  db.query('CALL InsertarCuentaPersona_web(?, ?, ?, ?, ?, ?, ?, ?)', [p_usuario, p_contrasenia, p_rut, p_dv, p_nombre, p_apellido, p_correo, p_token], (err, results) => {
    if (err) {
      console.error('Error al insertar datos:', err);
      res.status(500).json({ error: 'Error al insertar datos.' });
    } else {
      if (results && results[0] && results[0][0] && results[0][0].respuesta === 1) {
        console.log('Cuenta registrada correctamente');
        res.status(200).json({ message: 'Cuenta registrada correctamente' });
      } else {
        res.status(401).json({ error: 'Persona ya se encuentra registrada.' });
      }
    }
  });
});


router.post('/ValidarLogin_web', (req, res) => {
  const { p_rut, p_contrasenia } = req.body;
  db.query(
    'CALL ValidarLogin_web_id(?, ?)',
    [p_rut, p_contrasenia],
    (err, results) => {
      if (err) {
        console.error('Error al ejecutar el procedimiento almacenado:', err);
        res.status(500).json({ error: 'Error al verificar credenciales.' });
        return;
      }
      const userResult = results[0][0];

      if (userResult && userResult.id_cuenta) {
        const { id_cuenta, token_cuenta, correo_cuenta, usuario_cuenta } = userResult;
        res.status(200).json({ message: 'Credenciales válidas', id_cuenta, token_cuenta, correo_cuenta, usuario_cuenta });
      } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    }
  );
});


router.get('/obtenerUsuario/:rut', (req, res) => {
  const rut = req.params.rut;
  db.query('SELECT usuario_cuenta FROM cuenta WHERE rut_persona_cuenta = ?', [rut], (err, results) => {
    if (err) {
      console.error('Error al obtener el nombre de usuario:', err);
      res.status(500).json({ error: 'Error al obtener el nombre de usuario.' });
    } else {
      if (results.length > 0) {
        const usuario_cuenta = results[0].usuario_cuenta;
        res.status(200).json({ usuario_cuenta });
      } else {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      }
    }
  });
});
//CONSULTAS DE AREA
router.get('/carga_cb_area', (req, res) => {
  const sqlQuery = `
    WITH AreaEspecifica AS (
        SELECT a.id_area, a.descripcion_area AS descripcion_area 
        FROM area a 
        WHERE a.id_area IN (
            SELECT c.id_area_cuenta
            FROM cuenta c 
            WHERE c.id_area_cuenta IN (3, 33, 333)
        )  
        AND a.id_area NOT IN (1, 2, 4)
    ),
    AreaSinHoras AS (
        SELECT DISTINCT
            area.id_area,
            area.descripcion_area AS descripcion_area
        FROM
            area
        JOIN
            cuenta
        ON
            area.id_area = cuenta.id_area_cuenta
        JOIN
            hora
        ON
            cuenta.rut_persona_cuenta = hora.rut_especialista_hora
        WHERE
            hora.estado_hora = 0
    )
    SELECT 
        AreaEspecifica.id_area, 
        AreaEspecifica.descripcion_area
    FROM 
        AreaEspecifica
    JOIN 
        AreaSinHoras 
    ON 
        AreaEspecifica.id_area = AreaSinHoras.id_area;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error al obtener datos:', err);
      res.status(500).json({ error: 'Error al obtener los datos.' });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get('/obtenerUsuariosPorArea/:idArea', (req, res) => {
  const idArea = req.params.idArea;
  db.query(
    'SELECT CONCAT(p.nombre_persona, " ", p.apellido_persona) AS nombre_completo, c.rut_persona_cuenta ' +
    'FROM cuenta c ' +
    'INNER JOIN persona p ON c.rut_persona_cuenta = p.rut_persona ' +
    'WHERE c.id_area_cuenta = ?',
    [idArea],
    (err, results) => {
      if (err) {
        console.error('Error al obtener usuarios por área:', err);
        res.status(500).json({ error: 'Error al obtener usuarios por área.' });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

router.get('/horasPorEspecialista/:rutEspecialista', (req, res) => {
  const rutEspecialista = req.params.rutEspecialista;
  db.query(
    'SELECT DATE_FORMAT(CONCAT(anio_hora, "-", mes_hora, "-", dia_hora), "%Y-%m-%d") AS fecha, GROUP_CONCAT(CONCAT(SUBSTRING(hora_hora, 1, 2), ":", SUBSTRING(hora_hora, 3)) SEPARATOR ", ") AS horas_disponibles, GROUP_CONCAT(id_hora SEPARATOR ", ") AS ids_hora FROM hora WHERE rut_especialista_hora = ? AND estado_hora = 0 GROUP BY fecha',
    [rutEspecialista],
    (err, results) => {
      if (err) {
        console.error('Error al obtener las horas del especialista:', err);
        res.status(500).json({ error: 'Error al obtener las horas del especialista.' });
      } else {
        res.status(200).json(results);
      }
    }
  );
});
router.post('/reservarHora', (req, res) => {
  const { id_hora, id_cuenta } = req.body;

  db.query('CALL ReservarHora_web(?, ?)', [id_hora, id_cuenta], (err) => {
    if (err) {
      console.error('Error al reservar la hora:', err);
      res.status(500).json({ error: 'Error al reservar la hora.' });
    } else {
      res.status(200).json({ message: 'Hora reservada exitosamente.' });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////7


router.get('/obtenerEventos', (req, res) => {
  db.query('CALL obtener_eventos_web()', (err, results) => {
    if (err) {
      console.error('Error al obtener eventos:', err);
      res.status(500).json({ error: 'Error al obtener eventos.' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});
router.get('/obtenerEvento/:eventoId', (req, res) => {
  const eventoId = req.params.eventoId;
  db.query('CALL obtener_evento_por_id(?)', [eventoId], (err, results) => {
    if (err) {
      console.error('Error al obtener el evento:', err);
      res.status(500).json({ error: 'Error al obtener el evento.' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});
router.post('/inscribirEvento', (req, res) => {
  const { idCuenta, idEvento } = req.body;


  db.query('SELECT cupos_disponible_evento FROM evento WHERE id_evento = ?', [idEvento], (err, results) => {
    if (err) {
      console.error('Error al obtener la información del evento:', err);
      res.status(500).json({ error: 'Error al obtener la información del evento.' });
    } else {
      const cuposDisponibles = results[0].cupos_disponible_evento;

      if (cuposDisponibles <= 0) {
        res.status(400).json({ error: 'No hay cupos disponibles para este evento.' });
      } else {

        db.query('CALL IncribirUsuarioEnEvento(?, ?)', [idCuenta, idEvento], (err) => {
          if (err) {
            console.error('Error al inscribir al usuario en el evento:', err);
            res.status(500).json({ error: 'Error al inscribir al usuario en el evento.' });
          } else {
            res.status(200).json({ message: 'Inscripción exitosa en el evento.' });
          }
        });
      }
    }
  });
});

// OBTENER HORA DE RECETA
router.post('/obtenerHoraReceta', (req, res) => {
  const { dia, mes, anio, id_cuenta } = req.body;
  db.query('CALL obtenerHoraReceta(?, ?, ?, ?)', [dia, mes, anio, id_cuenta], (err, results) => {
    if (err) {
      console.error('Error al obtener la hora de la receta:', err);
      res.status(500).json({ error: 'Error al obtener la hora de la receta.' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

router.get('/obtenerreceta/:idHora', (req, res) => {
  const idHora = req.params.idHora;
  const query = `
    SELECT r.id_receta as "id_receta",
           CONCAT(p.nombre_persona, ' ', p.apellido_persona) as "nombre", h.hora_hora as "hora",
           (SELECT a.descripcion_area
            FROM hora h
            INNER JOIN cuenta_hora ch ON ch.id_hora = h.id_hora
            INNER JOIN cuenta c ON c.rut_persona_cuenta = h.rut_especialista_hora
            INNER JOIN area a ON a.id_area = c.id_area_cuenta
            WHERE h.id_hora = ?) as "area"
    FROM receta r
    INNER JOIN hora_receta hr ON hr.id_receta = r.id_receta
    INNER JOIN hora h ON h.id_hora = hr.id_hora
    INNER JOIN cuenta_hora ch ON h.id_hora = ch.id_hora
    INNER JOIN cuenta c ON c.id_cuenta = ch.id_cuenta
    INNER JOIN persona p ON p.rut_persona = h.rut_especialista_hora
    WHERE h.id_hora = ?;
  `;

  db.query(query, [idHora, idHora], (err, results) => {
    if (err) {
      console.error('Error al obtener los datos de receta:', err);
      res.status(500).json({ error: 'Error al obtener los datos de receta.' });
    } else {
      res.status(200).json(results);
    }
  });
});
// 
router.get('/obtenerMedicamentosReceta/:idReceta', (req, res) => {
  const idReceta = req.params.idReceta;
  const query = `
    SELECT r.descripcion_receta, m.nombre_medicamento,m.stock_medicamento,rm.cantidad,m.descripcion_medicamento
    FROM receta_medicamento rm
    INNER JOIN receta r ON rm.id_receta = r.id_receta
    INNER JOIN medicamento m ON m.id_medicamento = rm.id_medicamento
    WHERE rm.id_receta = ?;
  `;

  db.query(query, [idReceta], (err, results) => {
    if (err) {
      console.error('Error al obtener los medicamentos de la receta:', err);
      res.status(500).json({ error: 'Error al obtener los medicamentos de la receta.' });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get('/obtenerBoleta/:id_receta_boleta', (req, res) => {
  const idRecetaBoleta = req.params.id_receta_boleta;

  db.query('SELECT * FROM `boleta` WHERE `id_receta_boleta` = ?', [idRecetaBoleta], (err, results) => {
    if (err) {
      console.error('Error al obtener la boleta:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    } else {
      if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(404).json({ error: 'Boleta no encontrada.' });
      }
    }
  });
});
router.post('/validarRecetaYCrearBoleta', (req, res) => {
  const { idReceta } = req.body;
  db.query('CALL ValidarRecetaYCrearBoleta(?)', [idReceta], (err, results, fields) => {
    if (err) {
      console.error('Error al validar la receta y crear boleta:', err);
      if (err.sqlState === '45000') {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Error al validar la receta y crear boleta.' });
      }
    } else {
      res.status(200).json({ message: 'Receta validada y boleta creada exitosamente.' });
    }
  });
});


module.exports = router;
