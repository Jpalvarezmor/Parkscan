// src/components/ModalTarjeta.js
import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import config from '../config';
function ModalTarjeta({ show, onHide, user }) {
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreEnTarjeta, setNombreEnTarjeta] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState('credito');
  const [fechaExpiracion, setFechaExpiracion] = useState(new Date());

  const handleAddMetodoPago = async () => {
    const numeroTarjetaSinEspacios = numeroTarjeta.replace(/\s+/g, '');
  
    // Check if the card number is valid
    if (numeroTarjetaSinEspacios.length !== 16 || isNaN(numeroTarjetaSinEspacios)) {
      alert('Número de tarjeta inválido');
      return;
    }
  
    const lastFourDigits = numeroTarjetaSinEspacios.slice(-4);
  
    // Validate fechaExpiracion
    if (!fechaExpiracion || isNaN(fechaExpiracion.getTime())) {
      alert('Fecha de expiración inválida');
      return;
    }
  
    const year = fechaExpiracion.getFullYear();
    const month = String(fechaExpiracion.getMonth() + 1).padStart(2, '0');
    const fechaExpiracionConDia = `${year}-${month}-01`;
  
    // Ensure `user.rut` is defined
    if (!user || !user.rut) {
      alert('Usuario no especificado');
      return;
    }
  
    console.log("Data to send:", {
      usuario_id: user.rut,
      numero_tarjeta: lastFourDigits,
      nombre_en_tarjeta: nombreEnTarjeta,
      tipo_tarjeta: tipoTarjeta,
      fecha_expiracion: fechaExpiracionConDia,
    });
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/pago/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.rut,
          numero_tarjeta: lastFourDigits,
          nombre_en_tarjeta: nombreEnTarjeta,
          tipo_tarjeta: tipoTarjeta,
          fecha_expiracion: fechaExpiracionConDia,
        }),
      });
  
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Server response:", result);
  
      if (result.success) {
        alert('Método de pago añadido correctamente');
        onHide(true);
      } else {
        alert(result.message || 'Error al añadir método de pago');
      }
    } catch (error) {
      console.error('Error al añadir método de pago:', error);
      alert('Hubo un error al conectar con el servidor.');
    }
  };
  



  return (
    <Modal show={show} onHide={() => onHide(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Añadir Método de Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6} sm={12}>
              <Form.Group controlId="formNumeroTarjeta">
                <Form.Label>Número de Tarjeta</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 1234 5678 1234 5678"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} sm={12}>
              <Form.Group controlId="formNombreEnTarjeta">
                <Form.Label>Nombre en la Tarjeta</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre Completo"
                  value={nombreEnTarjeta}
                  onChange={(e) => setNombreEnTarjeta(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} sm={12}>
              <Form.Group controlId="formTipoTarjeta">
                <Form.Label>Tipo de Tarjeta</Form.Label>
                <Form.Control
                  as="select"
                  value={tipoTarjeta}
                  onChange={(e) => setTipoTarjeta(e.target.value)}
                >
                  <option value="credito">Crédito</option>
                  <option value="debito">Débito</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6} sm={12}>
              <Form.Group controlId="formFechaExpiracion">
                <Form.Label>Fecha de Expiración</Form.Label>
                <DatePicker
                  selected={fechaExpiracion}
                  onChange={(date) => setFechaExpiracion(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="MM/YYYY"
                  className="form-control"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onHide(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddMetodoPago}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalTarjeta;
