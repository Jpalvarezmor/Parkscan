import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import FilterButton from '../components/FilterButton';

function Index() {
  const [estacionamientos, setEstacionamientos] = useState([]);
  const [filtroTarifa, setFiltroTarifa] = useState(null);

  useEffect(() => {
    // Llama a la API para obtener los datos de los estacionamientos
    fetch('/api/estacionamientos')
      .then(response => response.json())
      .then(data => setEstacionamientos(data))
      .catch(error => console.error('Error al cargar estacionamientos:', error));
  }, [filtroTarifa]);

  const aplicarFiltroTarifa = (tarifa) => {
    setFiltroTarifa(tarifa);
    // Filtra los estacionamientos con tarifa <= tarifa
    setEstacionamientos(estacionamientos.filter(e => e.tarifa <= tarifa));
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Map estacionamientos={estacionamientos} />
      <FilterButton onApplyFilter={aplicarFiltroTarifa} />
    </div>
  );
}

export default Index;
