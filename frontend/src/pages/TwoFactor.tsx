import React, { useState } from 'react';
import axios from '../services/api.ts';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';

const TwoFactor: React.FC = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCodeForDisplay = (input: string) => {
    let formattedCode = input.replace(/\D/g, ''); 
    if (formattedCode.length > 3) {
      formattedCode = `${formattedCode.slice(0, 3)} ${formattedCode.slice(3, 6)}`;
    }
    return formattedCode.slice(0, 7); 
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCode = formatCodeForDisplay(e.target.value);
    setCode(formattedCode);
  };

  const handle2faVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('authToken'); 
    if (!token) {
      setMessage('No se encontró el token de autenticación.');
      setLoading(false);
      return;
    }

    const codeToSend = code.replace(/\D/g, '');

    try {
      const response = await axios.post('/verify-2fa', { code: codeToSend }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { token: newToken } = response.data; 
      localStorage.setItem('authToken', newToken); 

      window.location.href = '/dashboard'; 
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Error en la verificación 2FA');
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ maxWidth: 400, margin: '0 auto', padding: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Verificación 2FA
      </Typography>

      <form onSubmit={handle2faVerification} style={{ width: '100%' }}>
        <TextField
          label="Código de Google Authenticator"
          type="text"
          variant="outlined"
          value={code}
          onChange={handleCodeChange}
          required
          fullWidth
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
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ marginBottom: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verificar'}
        </Button>

        {message && (
          <Typography color="error" variant="body2" align="center">
            {message}
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default TwoFactor;
