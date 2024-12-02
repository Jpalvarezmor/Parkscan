import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import dayjs from 'dayjs';
import config from '../config';

// Importaciones actualizadas de MUI
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import StarBorderIcon from '@mui/icons-material/StarBorder';

function ModalHistoria({ show, onHide, pago, user }) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [reseñaExistente, setReseñaExistente] = useState(false);
  const [reseñaId, setReseñaId] = useState(null); // Opcional, si deseas manejar IDs únicos

  const customIcons = {
    1: {
      icon: <SentimentVeryDissatisfiedIcon />,
      label: 'Muy insatisfecho',
    },
    2: {
      icon: <SentimentDissatisfiedIcon />,
      label: 'Insatisfecho',
    },
    3: {
      icon: <SentimentSatisfiedIcon />,
      label: 'Neutral',
    },
    4: {
      icon: <SentimentSatisfiedAltIcon />,
      label: 'Satisfecho',
    },
    5: {
      icon: <SentimentVerySatisfiedIcon />,
      label: 'Muy satisfecho',
    },
  };

  function IconContainer(props) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value].icon}</span>;
  }

  // Función para obtener la reseña existente
  useEffect(() => {
    const fetchReseña = async () => {
      try {
        const formattedFechaIngreso = dayjs(pago.fecha_ingreso).format('YYYY-MM-DD HH:mm:ss');
        const response = await fetch(
          `${config.apiBaseUrl}/api/resenas/get?usuario_id=${user.rut}&matricula=${pago.matricula}&fecha_ingreso=${encodeURIComponent(formattedFechaIngreso)}`
        );
        const result = await response.json();
        if (result.success && result.reseña) {
          setCalificacion(result.reseña.calificacion);
          setComentario(result.reseña.comentario);
          setReseñaExistente(true);
          setReseñaId(result.reseña.id); // Si tienes un ID único
        } else {
          // Si no hay reseña existente, reiniciamos los campos
          setCalificacion(0);
          setComentario('');
          setReseñaExistente(false);
          setReseñaId(null);
        }
      } catch (error) {
        console.error('Error al obtener la reseña:', error);
      }
    };

    if (show) {
      fetchReseña();
    }
  }, [show, pago, user]);

  const handleSubmitReseña = async () => {
    if (calificacion === 0) {
      alert('Por favor, seleccione una calificación.');
      return;
    }
  
    const url = reseñaExistente
      ? `${config.apiBaseUrl}/api/resenas/update`
      : `${config.apiBaseUrl}/api/resenas/add`;
  
    // Formatea fecha_ingreso al formato adecuado para MariaDB (sin el 'T' ni 'Z')
    const formattedFechaIngreso = dayjs(pago.fecha_ingreso).format('YYYY-MM-DD HH:mm:ss');
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estacionamiento: pago.id_estacionamiento,
          usuario_id: user.rut,
          matricula: pago.matricula,
          fecha_ingreso: formattedFechaIngreso, // Usa el formato adecuado
          calificacion,
          comentario,
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert('Reseña enviada con éxito.');
        setReseñaExistente(true);
        if (reseñaExistente) {
          setReseñaId(result.reseña_id);
        }
      } else {
        alert('Error al enviar la reseña: ' + result.message);
      }
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
      alert('Error al enviar la reseña.');
    }
  };
  

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Matrícula:</strong> {pago.matricula}</p>
        <p><strong>Estacionamiento:</strong> {pago.nombre_estacionamiento}</p>
        <p><strong>Fecha de Ingreso:</strong> {dayjs(pago.fecha_ingreso).format('DD/MM/YYYY')}</p>
        <p><strong>Hora de Ingreso:</strong> {dayjs(pago.fecha_ingreso).format('HH:mm:ss')}</p>
        <p><strong>Fecha de Salida:</strong> {dayjs(pago.fecha_salida).format('DD/MM/YYYY')}</p>
        <p><strong>Hora de Salida:</strong> {dayjs(pago.fecha_salida).format('HH:mm:ss')}</p>
        <p><strong>Tiempo Estacionado (min):</strong> {pago.tiempo_estacionado}</p>
        <p><strong>Monto Total:</strong> ${pago.monto_total}</p>
        <p><strong>Método de Pago:</strong> {pago.metodo_pago}</p>

        <hr />
        <Box component="fieldset" mb={3} borderColor="transparent">
          <Typography component="legend">Califique su experiencia:</Typography>
          <Rating
            name="customized-icons"
            value={calificacion}
            onChange={(event, newValue) => {
              setCalificacion(newValue);
            }}
            getLabelText={(value) => customIcons[value].label}
            IconContainerComponent={IconContainer}
            precision={1}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
          />
        </Box>
        <Form.Group controlId="comentario" className="mt-3">
          <Form.Label>Comentario:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSubmitReseña} className="mt-3">
          {reseñaExistente ? 'Actualizar Reseña' : 'Enviar Reseña'}
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalHistoria;
