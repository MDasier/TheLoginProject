// src/components/Navbar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Nav: React.FC = () => {
  const [anchorElMenu, setAnchorElMenu] = React.useState<null | HTMLElement>(null);
  const [anchorElProfile, setAnchorElProfile] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate(); // Hook para redirigir

  // Verifica si el usuario está autenticado (si hay un token en localStorage)
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Función para manejar el logout
  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('authToken');
    // Redirigir al login
    navigate('/login');
  };

  // Función para manejar la navegación al login si no está autenticado
  const handleLoginRedirect = () => {
    navigate('/login');
    handleClose();
  };
  const handleRegisterRedirect = () => {
    navigate('/register');
    handleClose();
  };
  const handleHomeRedirect = () => {
    navigate('/');
    handleClose();
  };
  const handleDashboardRedirect = () => {
    navigate('/dashboard');
    handleClose();
  };

  // Función para manejar la apertura del menú de opciones
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenu(event.currentTarget);
  };

  // Función para manejar la apertura del menú de perfil
  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  // Función para manejar el cierre de ambos menús
  const handleClose = () => {
    setAnchorElMenu(null);
    setAnchorElProfile(null);
  };

  return (
    <AppBar position="static" color='transparent' sx={{ boxShadow: 'none', maxHeight: 'fit-content' }}>
      <Toolbar>
        {/* Icono de menú de opciones */}
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="menu"
          aria-controls="menu-option"
          aria-haspopup="true"
          onClick={handleMenuClick}
          /*sx={{ mr: 2 }}*/
        >
          <MenuIcon />
        </IconButton>

        {/* Menú de opciones */}
        <Menu
          id="menu-option"
          anchorEl={anchorElMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={Boolean(anchorElMenu)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleHomeRedirect}>Home</MenuItem>
          <MenuItem onClick={handleDashboardRedirect}>Dashboard</MenuItem>
          <MenuItem onClick={handleLoginRedirect}>Login</MenuItem>
          <MenuItem onClick={handleRegisterRedirect}>Registro</MenuItem>
        </Menu>

        {/* Título */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          The Login Project
        </Typography>

        {/* Botones de la barra de navegación */}
        <Box sx={{ display: 'flex' }}>
          {/* Icono de perfil */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuClick}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>

          {/* Menú de perfil */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorElProfile}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElProfile)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleClose}>Mi cuenta</MenuItem>
            {isAuthenticated && <MenuItem onClick={handleLogout}>Logout</MenuItem>}
          </Menu>

          {/* Si está autenticado, muestra el botón de Logout */}
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            // Si no está autenticado, muestra el botón de Login
            <Button color="inherit" onClick={handleLoginRedirect}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
