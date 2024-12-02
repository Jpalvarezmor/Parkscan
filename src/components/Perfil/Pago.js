import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';
import ModalTarjeta from './ModalTarjeta';
import config from '../config';

function Pago({ user }) {
  const [metodosPago, setMetodosPago] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMetodosPago = async () => {
    if (!user || !user.rut) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/pago/methods?usuario_id=${user.rut}`);
      const result = await response.json();

      if (result.success) {
        setMetodosPago(result.metodos);
      } else {
        console.error(result.message || 'Error al obtener métodos de pago');
      }
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
    }
  };

  useEffect(() => {
    fetchMetodosPago();
  }, [user]);

  const handleAddMetodoPago = () => setIsModalOpen(true);

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    if (refresh) {
      fetchMetodosPago();
    }
  };

  const handleDeleteMetodoPago = async (metodoId) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/pago/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo_id: metodoId }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Método de pago eliminado correctamente');
        fetchMetodosPago(); // Refresh the list
      } else {
        alert(result.message || 'Error al eliminar método de pago');
      }
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
    }
  };

  const renderMetodoPagoCard = (metodo) => (
    <Card key={metodo.metodo_id} style={{ margin: '10px', padding: '20px', maxWidth: '300px' }}>
      <Card.Body>
        <Card.Text style={{ fontSize: '1.2em', letterSpacing: '2px' }}>
          **** **** **** {metodo.numero_tarjeta.slice(-4)}
        </Card.Text>
        <Card.Text style={{ fontSize: '0.9em', color: 'gray' }}>{metodo.tipo_tarjeta}</Card.Text>
        <Card.Text style={{ fontWeight: 'bold' }}>{metodo.nombre_en_tarjeta}</Card.Text>
        <Card.Text style={{ fontSize: '0.8em', color: 'gray' }}>
          Expira {new Date(metodo.fecha_expiracion).toLocaleDateString()}
        </Card.Text>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteMetodoPago(metodo.metodo_id)}
          style={{ position: 'absolute', bottom: '10px', right: '10px' }}
        >
          Eliminar
        </Button>
      </Card.Body>
    </Card>
  );

  return (
    <div className="tab-content-background">
      <h3>Métodos de Pago</h3>
      {metodosPago.length === 0 ? (
        <div>
          <p>No tienes métodos de pago registrados.</p>
          <Button variant="primary" onClick={handleAddMetodoPago}>Añadir Método de Pago</Button>
        </div>
      ) : (
        <div>
          <div className="d-flex flex-wrap">
            {metodosPago.map(renderMetodoPagoCard)}
          </div>
          <Button variant="primary" onClick={handleAddMetodoPago} style={{ marginTop: '20px' }}>
            Añadir Método de Pago
          </Button>
        </div>
      )}
      <ModalTarjeta show={isModalOpen} onHide={handleCloseModal} user={user} />
    </div>
  );
}

export default Pago;
