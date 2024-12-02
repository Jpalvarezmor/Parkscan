import React, { useState } from 'react';

function FilterButton({ onApplyFilter }) {
  const [tarifa, setTarifa] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleFilter = () => {
    onApplyFilter(parseFloat(tarifa));
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
      <button onClick={() => setShowMenu(!showMenu)} style={{ padding: '10px' }}>
        <img src="filtro-icono.png" alt="Filtro" style={{ width: '24px', height: '24px' }} />
      </button>
      {showMenu && (
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
          <label>
            Tarifa máxima:
            <input
              type="number"
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </label>
          <button onClick={handleFilter} style={{ marginTop: '10px' }}>
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterButton;
