# TheLoginProject
It is a project to understand how a two-step verification login works.

![Screenshot](src/)
---

## 🚀 **Características**

- Registro de usuarios.
- Login/Logout.
- Interfaz moderna y responsiva utilizando **Material UI**.
- Verificación en dos pasos gracias a Google Authenticator.
- Envio de correos automáticos gracias a la librería 'smtplib'.

---

## 🛠️ **Tecnologías utilizadas**

- **React** y **TypeScript**: Para crear un frontend rápido, seguro y escalable.
- **Python**: Para crear el backend.
- **MongoDB**: Para almacenar los datos en BBDD.
- **Axios**: Cliente HTTP para realizar solicitudes a la API.
- **Material UI**: Para diseño e interfaz de usuario.
- **Postman**: Para comprobar endpoints y respuestas.
- **LocalStorage**: Para gestionar variables de sesión en el navegador.
---

## 📦 **Funciones y tecnologías principales del backend**

### **FUNCIONES**: 
*
    · Registro de Usuarios:
      - Creación de cuentas nuevas con contraseñas hasheadas.
      - Envío de correos de bienvenida.

    · Inicio de Sesión Seguro:
      - Autenticación con correo y contraseña.
      - Generación de tokens JWT.

    · Autenticación en Dos Factores (2FA):
      - Integración con aplicaciones como Google Authenticator usando TOTP.
      - Generación de códigos QR para facilitar la configuración.

    · Recuperación de Contraseñas:
      - Envío de correos con enlaces seguros para restablecer contraseñas.
      - Validación de contraseñas seguras según patrones definidos.

    · Notificaciones de Seguridad:
      - Envío de correos ante intentos de acceso desde navegadores no reconocidos.

### **TECNOLOGÍAS**:
*
    · FastAPI
        - Framework principal para construir las APIs RESTful.
        - Ofrece alto rendimiento y facilidad de uso gracias a su integración con Python tipo async y soporte de tipado estático.

    · Pydantic
        - Utilizado para la validación de datos y el modelado de esquemas.
        - Asegura que las solicitudes y respuestas cumplan con los requisitos definidos.

    · Motor (motor.motor_asyncio)
        - Cliente asíncrono para interactuar con bases de datos MongoDB.
        - Permite manejar operaciones de lectura y escritura de forma eficiente en un entorno asíncrono.

    · bcrypt
        - Usado para hashear y verificar contraseñas.
        - Proporciona un nivel alto de seguridad mediante el uso de algoritmos modernos de hashing.

    · pyotp
        - Implementación de One-Time Passwords (OTP) basada en el estándar TOTP (Time-Based One-Time Password).
        - Facilita la configuración de autenticación en dos factores (2FA).

    · Python's smtplib y MIME
        - Biblioteca estándar de Python para enviar correos electrónicos.
        - Utilizada junto con SMTP para enviar correos de recuperación de contraseña y notificaciones.

    · itsdangerous
        - Utilizado para generar y verificar tokens firmados de forma segura. (ej., recuperación de contraseñas).
        - Protege contra modificaciones maliciosas de los tokens.

    · JWT (JSON Web Tokens)
        - Empleado para autenticar a los usuarios.
        - Los tokens se generan y decodifican usando la biblioteca PyJWT con algoritmos seguros como HS256.

    · dotenv
        - Carga variables de entorno desde un archivo .env para separar la configuración sensible (como claves secretas y credenciales).

    · qrcode
        - Genera códigos QR para integrarse con aplicaciones de autenticación como Google Authenticator.

    · MongoDB
        - Base de datos NoSQL utilizada para almacenar información de usuarios, contraseñas hasheadas y configuraciones de seguridad como secretos TOTP.

    · Securidad y Validación Adicional
        - Uso de expresiones regulares para la validación de contraseñas.
        - Cookies seguras configuradas para almacenar identificadores de navegadores verificados.

    · UUID y Secrets
        - Generación de identificadores únicos (UUID) y tokens seguros mediante bibliotecas estándar de Python (uuid, secrets).
