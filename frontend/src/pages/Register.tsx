import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api.ts';
import { QRCodeSVG } from 'qrcode.react';
import { TextField, Button, Typography, Box } from '@mui/material';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const navigate = useNavigate();

  // Especificamos el tipo del evento como React.FormEvent para el formulario
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Enviar los datos de registro al backend
      const response = await axios.post('/register', { email, password });

      // Si el registro es exitoso, recibirás la URI del código QR
      setQrCodeUri(response.data.qr_code_uri);

    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Error registering');
    }
  };

  // Especificamos el tipo del evento como React.ChangeEvent para los campos de entrada
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleQRScanned = () => {
    navigate('/login');
  };

  return (
    <>
      {/*
      IPHONE
        https://apps.apple.com/us/app/google-authenticator/id388497605

      ANDROID
        https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=es&pli=1
      */}

      <Typography variant="h6" gutterBottom>
        *Necesitarás tener instalado 'Google Authenticator' en tu dispositivo móvil para poder utilizar esta funcionalidad
      </Typography>

      {qrCodeUri ? (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ maxWidth: 400, margin: '0 auto' }}>
          <Typography variant="h6" gutterBottom>
            Usa 'Google Authenticator' para escanear el código QR
          </Typography>
          <QRCodeSVG value={qrCodeUri} />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleQRScanned} 
            sx={{ marginTop: 2 }}
          >
            He escaneado el QR, continuar al login
          </Button>
        </Box>
      ) : (
        <form onSubmit={handleRegister}>
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ maxWidth: 400, margin: '0 auto' }}>
          <Typography variant="h4" gutterBottom>
            Registro
          </Typography>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
              required
              fullWidth
              color="warning"
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
              sx={{ marginBottom: 2 }}
              InputLabelProps={{
                style: { color: '#fff' },
              }}
              InputProps={{
                style: { color: '#fff' },
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              sx={{ marginBottom: 2 }}
            >
              Registrarme
            </Button>
            {message && <Typography color="error">{message}</Typography>}
          </Box>
        </form>
      )}
    </>
  );
};

export default Register;
