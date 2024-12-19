from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router

app = FastAPI()

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde el frontend en el puerto 3000
    #allow_origins=["http://localhost:5173"],  # Permite peticiones desde el frontend en el puerto 3000
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Permite todos los encabezados
)

# Rutas de autenticación
app.include_router(auth_router)

# Inicia el servidor FastAPI en el puerto 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}