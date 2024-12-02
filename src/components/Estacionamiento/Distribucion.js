import React, { useState, useEffect } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import config from '../config';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.dimensionX}, 30px);
  grid-gap: 5px;
  margin-top: 20px;
  justify-content: center;
  align-items: center;
`;

const GridCell = styled.div`
  width: 30px;
  height: 30px;
  background-color: ${(props) =>
    props.isParkingSpace ? '#4caf50' : '#ccc'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const HalfWidthFormGroup = styled(Form.Group)`
  flex: 1;
`;

function Distribucion({ selectedEstacionamiento }) {
  const [dimensionX, setDimensionX] = useState(0);
  const [dimensionY, setDimensionY] = useState(0);
  const [distribucion, setDistribucion] = useState([]);
  const [capacidadRestante, setCapacidadRestante] = useState(
    selectedEstacionamiento.capacidad
  );
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedEstacionamiento) {
      fetchDistribucion();
    }
  }, [selectedEstacionamiento]);

  const fetchDistribucion = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}/distribucion`
      );
      const data = await response.json();
      if (data.success) {
        setDimensionX(data.distribucion.dimension_x || 0);
        setDimensionY(data.distribucion.dimension_y || 0);
        const distribucionData = data.distribucion.distribucion
          ? JSON.parse(data.distribucion.distribucion)
          : [];
        setDistribucion(distribucionData);

        // Inicializar lista de números disponibles
        const usedNumbers = distribucionData.flat().filter((num) => num > 0);
        const allNumbers = Array.from(
          { length: selectedEstacionamiento.capacidad },
          (_, i) => i + 1
        );
        const available = allNumbers.filter((num) => !usedNumbers.includes(num));
        setAvailableNumbers(available);

        const espaciosOcupados = usedNumbers.length;
        setCapacidadRestante(selectedEstacionamiento.capacidad - espaciosOcupados);
      } else {
        console.error('Error al obtener la distribución:', data.message);
      }
    } catch (error) {
      console.error('Error al obtener la distribución:', error);
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const newValue = Math.max(Number(value), 1); // Asegurar que las dimensiones sean al menos 1
    if (name === 'dimensionX') {
      adjustDistribucion(Number(value), dimensionY); // Ajustar la distribución
      setDimensionX(newValue);
    } else if (name === 'dimensionY') {
      adjustDistribucion(dimensionX, Number(value)); // Ajustar la distribución
      setDimensionY(newValue);
    }
  };

  const adjustDistribucion = (newX, newY) => {
    const updatedDistribucion = [];
    const removedNumbers = []; // Números eliminados de la grilla

    for (let y = 0; y < newY; y++) {
      const existingRow = distribucion[y] || [];
      const newRow = [];

      for (let x = 0; x < newX; x++) {
        newRow.push(existingRow[x] || 0);
      }

      // Agregar a la lista de números eliminados los que ya no están en la fila
      removedNumbers.push(...existingRow.slice(newX).filter((num) => num > 0));
      updatedDistribucion.push(newRow);
    }

    // Agregar a la lista de números eliminados las filas eliminadas
    for (let y = newY; y < distribucion.length; y++) {
      removedNumbers.push(...distribucion[y].filter((num) => num > 0));
    }

    // Actualizar capacidad y lista de números disponibles
    setCapacidadRestante((prev) => prev + removedNumbers.length);
    setAvailableNumbers((prev) =>
      [...prev, ...removedNumbers].sort((a, b) => a - b)
    );

    setDistribucion(updatedDistribucion);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const newDistribucion = distribucion.map((row, rIndex) =>
      row.map((cell, cIndex) => {
        if (rIndex === rowIndex && cIndex === colIndex) {
          if (cell === 0 && capacidadRestante > 0) {
            const nextNumber = availableNumbers[0]; // Usar el menor número disponible
            setAvailableNumbers((prev) => prev.slice(1)); // Eliminar el número usado
            setCapacidadRestante(capacidadRestante - 1);
            return nextNumber;
          } else if (cell > 0) {
            setAvailableNumbers((prev) => [...prev, cell].sort((a, b) => a - b)); // Liberar el número y ordenarlo
            setCapacidadRestante(capacidadRestante + 1);
            return 0;
          }
        }
        return cell;
      })
    );

    setDistribucion(newDistribucion);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}/distribucion`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dimension_x: dimensionX,
            dimension_y: dimensionY,
            distribucion,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Distribución guardada con éxito.');
      } else {
        console.error('Error al guardar la distribución:', data.message);
      }
    } catch (error) {
      console.error('Error al guardar la distribución:', error);
    }
  };

  return (
    <div>
      <h3>Distribución de Estacionamientos</h3>
      <Form>
        <FormRow>
          <HalfWidthFormGroup controlId="dimensionX">
            <Form.Label>Dimensión X (Ancho)</Form.Label>
            <Form.Control
              type="number"
              name="dimensionX"
              value={dimensionX}
              onChange={handleDimensionChange}
              min="1"
            />
          </HalfWidthFormGroup>
          <HalfWidthFormGroup controlId="dimensionY">
            <Form.Label>Dimensión Y (Alto)</Form.Label>
            <Form.Control
              type="number"
              name="dimensionY"
              value={dimensionY}
              onChange={handleDimensionChange}
              min="1"
            />
          </HalfWidthFormGroup>
        </FormRow>
      </Form>
      {error && <Alert variant="danger">{error}</Alert>}
      <p>Capacidad restante: {capacidadRestante}</p>
      <GridContainer dimensionX={dimensionX}>
        {distribucion.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              isParkingSpace={cell > 0}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell > 0 ? cell : ''}
            </GridCell>
          ))
        )}
      </GridContainer>
      <Button variant="primary" onClick={handleSave} className="mt-3">
        Guardar
      </Button>
    </div>
  );
}

export default Distribucion;
