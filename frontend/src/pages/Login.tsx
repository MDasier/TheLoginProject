import React, { useState } from 'react';
import axios from '../services/api.ts';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Especificamos el tipo de evento como React.FormEvent<HTMLFormElement> para el evento de submit
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        '/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json', // Asegúrate de que se envíe como JSON
          }
        }
      );
      localStorage.setItem('authToken', response.data.token);
      navigate('/2fa'); // Redirige a la página 2fa
    } catch (err: any) {
      if (err.response) {
        setMessage(err.response.data?.detail || 'Error logging in');
      } else {
        setMessage('Network or server error');
      }
    }
  };

  // Especificamos el tipo de evento como React.ChangeEvent<HTMLInputElement> para los eventos de cambio
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ maxWidth: 400, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      
      <form onSubmit={handleLogin} style={{ width: '100%', color: 'white' }}>
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={handleEmailChange}
          required
          fullWidth
          color="warning"
          placeholder="Email"
          sx={{ marginBottom: 2 }}
          InputLabelProps={{
            style: { color: '#fff' },
          }}
          InputProps={{
            style: { color: '#fff' },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={handlePasswordChange}
          required
          fullWidth
          color="warning"
          placeholder="123456"
          InputLabelProps={{
            style: { color: '#fff' },
          }}
          InputProps={{
            style: { color: '#fff' },
          }}
          sx={{ marginBottom: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          Login
        </Button>

        {message && <Typography color="error" variant="body2">{message}</Typography>}
      </form>
    </Box>
  );
};

export default Login;
