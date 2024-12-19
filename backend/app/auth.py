from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr, Field, ValidationError
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import pyotp
import os
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import re
import qrcode
import jwt
from datetime import datetime, timedelta
from fastapi.responses import Response
import hashlib
import secrets
from uuid import uuid4


# Cargar variables de entorno
load_dotenv()

router = APIRouter()
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client['bigProject']

# Configurar el generador de tokens
SECRET_KEY = os.getenv("SECRET_KEY")
s = URLSafeTimedSerializer(SECRET_KEY)

# Función para hashear la contraseña
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Función para verificar la contraseña
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Función para generar el token de recuperación
def generate_reset_token(email: str) -> str:
    return s.dumps(email, salt="password-reset-salt")

# Función para verificar el token de recuperación
def verify_reset_token(token: str) -> str:
    try:
        email = s.loads(token, salt="password-reset-salt", max_age=3600)  # Token válido por 1 hora
        return email
    except:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

def create_jwt(user_data):
    """Genera un token JWT para el usuario."""
    expiration = datetime.utcnow() + timedelta(hours=1)  # Expira en 1 hora
    payload = {
        "email": user_data["email"],
        "exp": expiration,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def decode_jwt(token: str):
    """Decodifica un token JWT y valida su validez."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("El token ha expirado.")
    except jwt.InvalidTokenError:
        raise ValueError("El token es inválido.")


# Función para enviar un correo genérico
def send_email(subject: str, to: str, body: str):
    sender_email = os.getenv("SENDER_EMAIL")
    password = os.getenv("EMAIL_PASSWORD")
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar el correo: {str(e)}")

# Función para enviar el correo de recuperación
def send_reset_email(user_email: str, reset_token: str):
    sender_email = "tu_email@gmail.com"
    password = "tu_contraseña_de_correo"
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = user_email
    msg['Subject'] = "Recuperación de Contraseña"
    
    reset_url = f"http://localhost:8000/reset-password?token={reset_token}"
    body = f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {reset_url}"
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, user_email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar el correo: {str(e)}")

# Modelos de Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordRecoveryRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    new_password: str
    token: str

class TwoFactorRequest(BaseModel):
    code: str

class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str

# Función para generar el URI del QR de Google Authenticator
def generate_qr_code(secret: str, email: str) -> str:
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=email, issuer_name="TheLoginProject")
    return uri

# Ruta para login
@router.post('/login')
async def login(user: LoginRequest):
    print(user)
    try:
        print("Request received:", user.dict())  # Depuración

        # Buscar usuario en la base de datos
        user_data = await db.users.find_one({"email": user.email})
        if not user_data:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Verificar contraseña
        if not verify_password(user.password, user_data['password']):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Generar un token JWT (sin incluir TOTP secret)
        jwt_token = create_jwt({"email": user.email})

        return {"message": "Login successful", "token": jwt_token}

    except ValidationError as e:
        print("Validation error:", e.json())
        raise HTTPException(status_code=422, detail="Invalid input")


async def get_token(authorization: str = Header(...)):
    if not authorization:
        raise HTTPException(status_code=400, detail="Token missing in the request header")
    
    # Extracción del token de la cadena 'Bearer <token>'
    token = authorization.split(" ")[1]  # "Bearer" es la primera palabra
    print(f"Token recibido: {token}")  # Log temporal
    return token

# Verificar el código 2FA
@router.post('/verify-2fa')
async def verify_2fa(
    response: Response,
    data: TwoFactorRequest,
    token: str = Depends(get_token),
    cookie: Optional[str] = Header(None)
):
    try:
        # Decodificar el token JWT para obtener el email del usuario
        payload = decode_jwt(token)
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    # Buscar al usuario en la base de datos
    user_data = await db.users.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificar el código TOTP
    secret = user_data.get("totp_secret")
    if not secret:
        raise HTTPException(status_code=400, detail="2FA not enabled for this user")

    totp = pyotp.TOTP(secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    # Verificar si el navegador ya está registrado
    # registered_browsers = user_data.get("trusted_browsers", [])
    # if cookie in registered_browsers:
        # Si la cookie es válida, no enviamos correo
    #     return {"message": "2FA verified successfully", "token": create_jwt(user_data)}
    # else:
    #     print("Cookie no válida. Continuando con flujo de notificación.")  # Depuración
    # Si no existe una cookie válida, enviamos el correo de notificación
    # body = (
    #     f"Hola {email},\n\n"
    #     "Se ha confirmado un nuevo acceso a tu cuenta. "
    #     "Si no reconoces esta actividad, te recomendamos cambiar tu contraseña de inmediato.\n\n"
    #     "Gracias,\nEl equipo de seguridad."
    # )
    # send_email("Nuevo acceso desde navegador", email, body)

    # Generar un identificador único para este navegador y registrarlo
    # new_browser_id = str(uuid4())
    # registered_browsers.append(new_browser_id)
    # await db.users.update_one({"email": email}, {"$set": {"trusted_browsers": registered_browsers}})

    # Establecer la cookie con el nuevo identificador
    # response.set_cookie(
    #     key="verified_browser",
    #     value=new_browser_id,
    #     httponly=True,
    #     samesite="Strict",
    #     max_age=3600 * 24 * 30  # Caducidad de 30 días
    # )

    return {"message": "2FA verified successfully", "token": create_jwt(user_data)}

    # Si no existe una cookie, enviamos el correo de notificación
    # body = (
    #     f"Hola {email},\n\n"
    #     "Se ha confirmado el acceso a tu cuenta desde un nuevo navegador. "
    #     "Si no reconoces esta actividad, te recomendamos cambiar tu contraseña de inmediato.\n\n"
    #     "Gracias,\nEl equipo de seguridad."
    # )
    # send_email("Nuevo acceso desde navegador", email, body)

    # Generar una cookie segura y establecerla en la respuesta
    # cookie_hash = hashlib.sha256(email.encode('utf-8')).hexdigest()
    # response.set_cookie(
    #     key="verified_browser",
    #     value=cookie_hash,
    #     httponly=True,       # La cookie no puede ser accedida por JavaScript
    #     samesite="Strict",   # La cookie no se envía con solicitudes de otros sitios
    #     max_age=3600 * 24 * 30  # Caducidad de 30 días
    # )

    # return {"message": "2FA verified successfully", "token": jwt_token}



# Ruta para recuperar la contraseña
@router.post('/recover-password')
async def recover_password(request: PasswordRecoveryRequest):
    user_data = await db.users.find_one({"email": request.email})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generar token de recuperación y enviarlo
    reset_token = generate_reset_token(request.email)
    send_reset_email(request.email, reset_token)
    
    return {"message": "Password recovery email sent"}

# Ruta para restablecer la contraseña
@router.post('/reset-password')
async def reset_password(request: ResetPasswordRequest):
    # Verificar el token de recuperación
    email = verify_reset_token(request.token)
    
    # Verificar si el usuario existe
    user_data = await db.users.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validar la nueva contraseña
    if not validate_password(request.new_password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain at least one number and one special character.")
    
    # Hashear la nueva contraseña y actualizarla
    hashed_password = hash_password(request.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password": hashed_password}})
    
    return {"message": "Password successfully updated"}

# Función de validación de la contraseña
def validate_password(password: str) -> bool:
    return bool(re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$', password))


# Ruta para registrar un nuevo usuario
@router.post("/register")
async def register_user(user: UserCreateSchema, response: Response):
    # Verifica si el usuario ya existe
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hashear la contraseña
    hashed_password = hash_password(user.password)

    # Guardar el nuevo usuario en la base de datos
    new_user = {
        "email": user.email,
        "password": hashed_password,
    }

    # Insertar el nuevo usuario
    insert_result = await db.users.insert_one(new_user)

    # Generar el secreto TOTP para el nuevo usuario
    secret = pyotp.random_base32()  # Genera un nuevo secreto TOTP
    await db.users.update_one({"email": user.email}, {"$set": {"totp_secret": secret}})

    # Generar URI para Google Authenticator (QRCode)
    uri = generate_qr_code(secret, user.email)

    # Enviar correo de bienvenida
    body = (
        f"Hola {user.email},\n\n"
        "¡Gracias por registrarte en nuestra plataforma! "
        "Estamos emocionados de tenerte a bordo. Si tienes alguna pregunta, no dudes en contactarnos.\n\n"
        "Gracias,\nEl equipo de soporte."
    )
    send_email("¡Bienvenido a la plataforma!", user.email, body)

    # Generar una cookie segura para el navegador
    cookie_hash = hashlib.sha256(user.email.encode('utf-8')).hexdigest()
    response.set_cookie(
        key="verified_browser",
        value=cookie_hash,
        httponly=True,
        samesite="Strict",
        max_age=3600 * 24 * 30  # Caducidad de 30 días
    )

    return {"message": "User successfully registered", "qr_code_uri": uri}


# Función para generar el URI del QR de Google Authenticator
def generate_qr_code(secret: str, email: str) -> str:
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=email, issuer_name="TheLoginProject")  # Genera el URI
    return uri