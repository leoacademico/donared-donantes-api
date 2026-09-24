# Módulo de Registro de Personas Donantes

Módulo funcional con autenticación JWT, roles (`administrador` / `usuario`) y pruebas unitarias,
correspondiente al punto 1 de la entrega final del reto (Implementación y seguridad).

## Stack
- Node.js + Express
- jsonwebtoken (JWT) + bcryptjs (hash de contraseñas)
- Jest + Supertest (pruebas unitarias e integración)

## Estructura
```
src/
  config.js              Configuración (secreto JWT, roles)
  app.js                 Definición de la app Express
  server.js              Arranque del servidor
  models/
    userStore.js         Store en memoria de usuarios
    donorStore.js         Store en memoria de donantes
  middleware/
    auth.js               authenticate (JWT) y authorize (roles)
  controllers/
    authController.js     Registro / login
    donorController.js    CRUD de donantes
  routes/
    authRoutes.js
    donorRoutes.js
tests/                    Pruebas unitarias e integración (Jest + Supertest)
```

## Instalación
```bash
npm install
```

## Ejecutar el servidor
```bash
npm start
# Servidor en http://localhost:3000
```

Variables de entorno opcionales (crear un archivo `.env` o exportarlas):
- `JWT_SECRET` (por defecto usa un valor de desarrollo, **cámbialo en producción**)
- `JWT_EXPIRES_IN` (por defecto `1h`)
- `PORT` (por defecto `3000`)

## Ejecutar pruebas con cobertura
```bash
npm test
```
El umbral configurado en `package.json` exige ≥80% de cobertura (statements, branches,
functions, lines). La suite actual alcanza ~97% de cobertura de sentencias.

## Endpoints

### Autenticación
| Método | Ruta                | Descripción                                  |
|--------|---------------------|-----------------------------------------------|
| POST   | /api/auth/register  | Crea un usuario (`username`, `password`, `role` opcional: `administrador`/`usuario`) |
| POST   | /api/auth/login     | Devuelve un JWT (`username`, `password`)      |

### Donantes (requieren header `Authorization: Bearer <token>`)
| Método | Ruta              | Roles permitidos              | Descripción             |
|--------|-------------------|--------------------------------|--------------------------|
| GET    | /api/donors       | administrador, usuario         | Lista todos los donantes |
| GET    | /api/donors/:id   | administrador, usuario         | Obtiene un donante       |
| POST   | /api/donors       | administrador                  | Crea un donante          |
| PUT    | /api/donors/:id   | administrador                  | Actualiza un donante     |
| DELETE | /api/donors/:id   | administrador                  | Elimina un donante       |

### Ejemplo de uso (curl)
```bash
# Registrar un administrador
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","role":"administrador"}'

# Iniciar sesión
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Crear un donante (usar el token devuelto por /login)
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Juan Pérez","email":"juan@mail.com","bloodType":"O+"}'
```

## Pipeline CI/CD (GitHub Actions)

Definido en `.github/workflows/ci-cd.yml`, con tres etapas encadenadas:

1. **test** — instala dependencias y corre `npm test` (Jest con umbral de cobertura de 80%).
   El pipeline falla si la cobertura baja de ese umbral. Publica el reporte de cobertura como artefacto.
2. **build** — construye la imagen Docker del módulo (`Dockerfile`) y la publica como artefacto,
   solo si la etapa `test` fue exitosa (`needs: test`).
3. **deploy** — se ejecuta únicamente en push a `main`, y despliega al entorno de prueba (staging)
   invocando un *deploy hook* HTTP. Requiere configurar el secreto `STAGING_DEPLOY_HOOK_URL` en
   GitHub (Settings → Secrets → Actions) con la URL del deploy hook de tu proveedor (Render,
   Railway, Fly.io, etc.). Si no está configurado, el job lo indica claramente y no falla el pipeline.

Se dispara automáticamente en cada `push` a `main`/`develop` y en cada `pull request` hacia `main`.

### Cómo activarlo
1. Sube este proyecto a un repositorio de GitHub.
2. (Opcional pero recomendado) Crea un servicio en Render/Railway/Fly.io a partir del `Dockerfile`
   y copia su *deploy hook URL*.
3. En GitHub: Settings → Secrets and variables → Actions → New repository secret →
   `STAGING_DEPLOY_HOOK_URL`.
4. Haz push a `main`: la pestaña **Actions** del repositorio mostrará las tres etapas ejecutándose.

## Notas de diseño
- Los datos se guardan en memoria (arrays) para simplificar la entrega; en un entorno real
  se reemplazarían por una base de datos y los stores (`userStore`, `donorStore`) exponen
  la misma interfaz para facilitar ese cambio.
- Las contraseñas se almacenan como hash con `bcryptjs` (nunca en texto plano).
- El middleware `authorize` es reutilizable para restringir cualquier ruta a uno o más roles.
