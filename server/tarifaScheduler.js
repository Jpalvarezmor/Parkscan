const db = require('./config/db');
const dayjs = require('dayjs');
const localeData = require('dayjs/plugin/localeData');
const es = require('dayjs/locale/es');

// Configurar dayjs para usar localización en español
dayjs.extend(localeData);
dayjs.locale('es'); // Establecer español como idioma predeterminado

const refrescarTarifas = () => {
  const now = dayjs();
  const currentTime = now.format('HH:mm');
  const currentDay = now.format('dddd'); // Obtendrá el día en español en minúsculas

  // Consulta para obtener todas las tarifas aplicables al día actual
  const sql = `
    SELECT *
    FROM tarifa
    WHERE FIND_IN_SET(?, dias_semana) > 0
    ORDER BY id_estacionamiento, hora_inicio
  `;
  const params = [currentDay];


  db.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al obtener tarifas:', error);
    } else {
      // Agrupar tarifas por id_estacionamiento
      const tarifasPorEstacionamiento = {};
      results.forEach((tarifa) => {
        if (!tarifasPorEstacionamiento[tarifa.id_estacionamiento]) {
          tarifasPorEstacionamiento[tarifa.id_estacionamiento] = [];
        }
        tarifasPorEstacionamiento[tarifa.id_estacionamiento].push(tarifa);
      });

      // Para cada estacionamiento, determinar la tarifa activa
      Object.keys(tarifasPorEstacionamiento).forEach((id_estacionamiento) => {
        const tarifas = tarifasPorEstacionamiento[id_estacionamiento];

        // Filtrar tarifas cuya hora de inicio es menor o igual a la hora actual
        const tarifasValidas = tarifas.filter((tarifa) => tarifa.hora_inicio <= currentTime);

        if (tarifasValidas.length > 0) {
          // Obtener la tarifa con la hora de inicio mayor
          const tarifaActiva = tarifasValidas.reduce((prev, current) =>
            prev.hora_inicio > current.hora_inicio ? prev : current
          );

          // Actualizar la tarifa en la tabla estacionamiento
          const updateEstacionamientoSql = `UPDATE estacionamiento SET tarifa = ? WHERE id = ?`;
          db.query(
            updateEstacionamientoSql,
            [tarifaActiva.tarifa, id_estacionamiento],
            (error) => {
              if (error) {
                console.error('Error al actualizar tarifa en estacionamiento:', error);
              }
            }
          );
        }
      });
    }
  });
};

const actualizarEstacionados = () => {
  // Consulta para obtener todos los vehículos estacionados junto con la tarifa actual del estacionamiento
  const sql = `
    SELECT e.Matricula, e.Id_estacionamiento, e.tiempo_estacionado, e.monto_total,
           est.tarifa
    FROM estacionado e
    JOIN estacionamiento est ON e.Id_estacionamiento = est.id
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener estacionados:', error);
    } else {
      results.forEach((row) => {
        const nuevoTiempoEstacionado = row.tiempo_estacionado + 1;
      
        // Convertir monto_total y tarifa a números antes de sumarlos
        const montoTotalNumerico = Number(row.monto_total) || 0;
        const tarifaNumerica = Number(row.tarifa) || 0;
        const nuevoMontoTotal = montoTotalNumerico + tarifaNumerica;
      
        // Actualizar los valores en la tabla estacionados
        const updateSql = `
          UPDATE estacionado
          SET tiempo_estacionado = ?, monto_total = ?
          WHERE Matricula = ?
        `;
        const params = [nuevoTiempoEstacionado, nuevoMontoTotal, row.Matricula];

        db.query(updateSql, params, (error) => {
          if (error) {
            console.error('Error al actualizar estacionado:', error);
          } else {
          }
        });
      });
    }
  });
};

const programarRefrescos = () => {
  // Ejecutar inmediatamente al iniciar
  refrescarTarifas();

  // Calcular el tiempo restante hasta el siguiente múltiplo de 10 minutos
  const now = dayjs();
  const minutosActuales = now.minute();
  const minutosRestantes = 10 - (minutosActuales % 10);
  const milisegundosRestantes = minutosRestantes * 60 * 1000 - now.second() * 1000 - now.millisecond();

  // Programar la primera ejecución
  setTimeout(() => {
    refrescarTarifas();

    // Programar ejecuciones cada 10 minutos
    setInterval(() => {
      refrescarTarifas();
    }, 10 * 60 * 1000);
  }, milisegundosRestantes);
};

const programarActualizacionesEstacionados = () => {
  actualizarEstacionados();

  setInterval(() => {
    actualizarEstacionados();
  }, 60 * 1000);
};

// Iniciar la programación de refrescos
programarRefrescos();
programarActualizacionesEstacionados();


module.exports = { refrescarTarifas };
