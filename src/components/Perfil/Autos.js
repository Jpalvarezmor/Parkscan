import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Carousel } from 'primereact/carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import ModalAuto from './ModalAuto';
import dayjs from 'dayjs';
import config from '../config';
function Autos({ user }) {
  const [autos, setAutos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [flippedCard, setFlippedCard] = useState(null);

  // Opciones responsivas para mostrar el número de elementos en el carrusel según el ancho de la pantalla
  const responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5, numScroll: 3 },
    { breakpoint: '768px', numVisible: 3, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchAutos();
  }, [user]);

  const fetchAutos = async () => {
    if (!user || !user.rut) return;
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auto/user?rut=${user.rut}`);
      const result = await response.json();
      if (result.success) {
        const autosConEstacionamiento = await Promise.all(
          result.autos.map(async (auto) => {
            const estacionadoResponse = await fetch(
              `${config.apiBaseUrl}/api/auto/status?matricula=${auto.matricula}`
            );
            const estacionadoResult = await estacionadoResponse.json();
            return estacionadoResult.success
              ? { ...auto, ...estacionadoResult.estacionado, estacionado: true }
              : { ...auto, estacionado: false };
          })
        );
        setAutos(autosConEstacionamiento);
      }
    } catch (error) {
      console.error('Error al obtener los vehículos:', error);
    }
  };

  const handleAddVehicle = () => setIsModalOpen(true);
  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    if (refresh) fetchAutos();
  };

  const handleDeleteVehicle = async (matricula) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auto/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula }),
      });
      const result = await response.json();
      if (result.success) {
        setAutos(autos.filter((auto) => auto.matricula !== matricula));
        alert('Vehículo eliminado');
      }
    } catch (error) {
      console.error('Error al eliminar el vehículo:', error);
    }
  };

  const toggleFlip = (matricula) => {
    setFlippedCard(flippedCard === matricula ? null : matricula);
  };

  const renderAutoCard = (auto) => {
    const horaIngreso = dayjs(auto.hora_ingreso);
    const tiempoEstacionado = currentTime.diff(horaIngreso, 'minute');
    const totalParcial = tiempoEstacionado * auto.tarifa;

    return (
      <div
        key={auto.matricula}
        className={`auto-card-container ${flippedCard === auto.matricula ? 'selected' : ''}`}
        onClick={() => toggleFlip(auto.matricula)}
      >
        <div className={`auto-card ${flippedCard === auto.matricula ? 'is-flipped' : ''}`}>
          <div className="auto-card-front">
            {auto.matricula}
          </div>
          <div className="auto-card-back">
            <div className="auto-info">
              {auto.estacionado ? (
                <>
                  <p><strong>{auto.nombre_estacionamiento}</strong></p>
                  <p><strong>Ingreso:</strong> {horaIngreso.format('DD/MM/YYYY')} {horaIngreso.format('HH:mm')}</p>
                  <p><strong>Tiempo:</strong> {tiempoEstacionado} min</p>
                  <p><strong>Tarifa:</strong> ${auto.tarifa} /min</p>
                  <p><strong>Total:</strong> ${totalParcial}</p>
                </>
              ) : (
                <>
                  <p><strong>Modelo:</strong> {auto.modelo}</p>
                  <p><strong>Color:</strong> {auto.color}</p>
                  <Button
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(auto.matricula); }}
                    className="mt-2"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content-background">
      <h3>Autos Registrados</h3>
      {autos.length === 0 && <p>No tienes vehículos registrados.</p>}
      <Carousel
        value={autos}
        numScroll={1}
        numVisible={3}
        responsiveOptions={responsiveOptions}
        itemTemplate={renderAutoCard}
        className="custom-carousel"
        circular
        autoplayInterval={3000}
      />
      <Button variant="primary" onClick={handleAddVehicle} className="mt-3">
        Añadir Vehículo
      </Button>
      <ModalAuto show={isModalOpen} onHide={handleCloseModal} user={user} />
    </div>
  );
}

export default Autos;
