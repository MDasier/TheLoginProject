import { Link } from 'react-router-dom';

const Home = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return (
    <div style={{ padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Página de inicio</h2>
      {isAuthenticated ? (
            <h3>Aqui se mostrará el contenido de la página de inicio</h3>
          ) : (
            <div>
              <h3>Inicia sesión o regístrate para acceder a la página de inicio</h3>
              <Link to="/login" style={{ color: '#1976D2', textDecoration: 'none' }}>Iniciar sesión</Link>
              <br />
              <Link to="/register"  style={{ color: '#1976D2', textDecoration: 'none' }}>Registrarse</Link>
            </div>            
          )}      
    </div>
  );
};

export default Home;
