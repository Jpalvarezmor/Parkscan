import React, { useState } from 'react';
import { Navbar, Container, Offcanvas, Nav, Button, ButtonGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import config from './config';

function CustomNavbar({ user, logout, handleShowLogin, handleShowRegister }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleNavigateToTab = (tab) => {
    navigate(`/perfil?tab=${tab}`);
  };

  const handleNavigateToEstacionamientoTab = (tab) => {
    navigate(`/estacionamiento?tab=${tab}`);
  };

  const handleNavigateToAdministrarTab = (tab) => {
    navigate(`/administrar?tab=${tab}`);
  };

  const renderUserMenu = () => {
    const role = user.role;
  
    return (
      <>
        {/* Menú Perfil */}
        <Nav.Link
          onClick={() => toggleMenu('perfil')}
          style={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#383b3f',
            cursor: 'pointer',
          }}
        >
          Perfil
        </Nav.Link>
        {activeMenu === 'perfil' && (
          <div style={{ paddingLeft: '1rem' }}>
            <Nav.Link onClick={() => handleNavigateToTab('historial')}>Historial</Nav.Link>
            <Nav.Link onClick={() => handleNavigateToTab('autos')}>Autos</Nav.Link>
            {role === 2 && (
              <Nav.Link onClick={() => handleNavigateToTab('pago')}>Pago</Nav.Link>
            )}
          </div>
        )}
  
        {/* Menú Estacionamiento */}
        {(role === 1 || role === 2) && (
          <>
            <Nav.Link
              onClick={() => toggleMenu('estacionamiento')}
              style={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: '#383b3f',
                cursor: 'pointer',
              }}
            >
              Estacionamiento
            </Nav.Link>
            {activeMenu === 'estacionamiento' && (
              <div style={{ paddingLeft: '1rem' }}>
                <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('estacionados')}>Estacionados</Nav.Link>
                <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('historial')}>Historial</Nav.Link>
                {role === 1 && (
                  <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('estacionar')}>Estacionar</Nav.Link>
                )}
                {role === 2 && (
                  <>
                    <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('tarifa')}>Tarifa</Nav.Link>
                    <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('trabajadores')}>Trabajadores</Nav.Link>
                    <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('distribucion')}>Distribución</Nav.Link>
                    <Nav.Link onClick={() => handleNavigateToEstacionamientoTab('dashboard')}>Dashboard</Nav.Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
  
        {/* Opción de Cerrar Sesión */}
        <Nav.Link onClick={logout} style={{ color: '#383b3f' }}>
          Cerrar Sesión
        </Nav.Link>
      </>
    );
  };
  
  

  return (
    <Navbar expand={false} className="fixed-top bg-warning custom-navbar">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="brand-text">
          Park Scan
        </Navbar.Brand>

        {!user.isLoggedIn ? (
          <ButtonGroup>
            <Button
              variant="light"
              onClick={handleShowLogin}
              style={{
                backgroundColor: '#f3f5f9',
                color: '#383b3f',
                marginRight: '0.5rem',
                fontSize: '1rem',
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="light"
              onClick={handleShowRegister}
              style={{
                backgroundColor: '#f3f5f9',
                color: '#383b3f',
                fontSize: '1rem',
              }}
            >
              Registrarse
            </Button>
          </ButtonGroup>
        ) : (
          <Navbar.Toggle aria-controls="offcanvasNavbar" className="me-2" />
        )}

        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3">
              {user.isLoggedIn && renderUserMenu()}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
