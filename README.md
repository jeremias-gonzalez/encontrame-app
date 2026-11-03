# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

======================================================================
GUÍA DE ENDPOINTS Y REQUEST BODIES (JSON) PARA EL FRONTEND
======================================================================

Nota: Para los endpoints protegidos con JWT, enviar en Headers:
    Authorization: Bearer <access_token>


----------------------------------------------------------------------
1. AUTENTICACIÓN (/auth)
----------------------------------------------------------------------

[POST] /auth/register
Descripción: Registra un nuevo usuario en la app.
Request Body (JSON):
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "password123",
  "telefono": "+5491122334455",
  "telefono_secundario": "+5491199887766",
  "direccion": "Av. Colón 123",
  "ciudad": "Córdoba",
  "rol": "dueno",
  "activo": true
}
* Campos obligatorios: nombre, email, contraseña (mínimo 6 caracteres).

[POST] /auth/login
Descripción: Inicia sesión y devuelve el token JWT Bearer.
Request Body (JSON):
{
  "email": "juan@example.com",
  "contraseña": "password123"
}
* Devuelve: { "access_token": "...", "token_type": "bearer", "usuario": {...} }


----------------------------------------------------------------------
2. ESCANEO PÚBLICO Y RECLAMO (/scan)  [CORE DE ENCONTRAME]
----------------------------------------------------------------------

[GET] /scan/{identificador}
Descripción: Endpoint público al escanear QR o acercar celular por NFC.
* {identificador} puede ser el token_publico (ej: enc-8f12a4b3), el codigoQR o el uidNFC.
* No lleva Request Body.
* Respuesta si el tag es VIRGEN (no reclamado):
  {
    "reclamado": false,
    "token_publico": "enc-8f12a4b3",
    "codigoQR": "QR-12345",
    "estado_tag": "disponible",
    "mensaje": "¡Bienvenido a Encontrame!...",
    "mascota": null,
    "veterinaria": { ... }
  }
* Respuesta si el tag ya está CONFIGURADO (reclamado):
  {
    "reclamado": true,
    "token_publico": "enc-8f12a4b3",
    "estado_tag": "reclamado",
    "mascota": {
      "nombre": "Rocky",
      "especie": "Perro",
      "raza": "Labrador",
      "foto_url": "https://...",
      "estado_extravio": "en_casa",
      "notas_medicas": "Toma medicación cardíaca",
      "mensaje_personalizado": "Por favor ayúdame a volver a casa",
      "contacto": {
        "nombre": "Juan Pérez",
        "telefono": "+5491122334455",
        "whatsapp_url": "https://wa.me/5491122334455?text=..."
      }
    }
  }

[POST] /scan/{identificador}/reportar
Descripción: El rescatista envía su ubicación GPS y/o mensaje al dueño (Público, sin login).
Request Body (JSON):
{
  "latitud": -31.4201,
  "longitud": -64.1888,
  "mensaje": "Lo tengo retenido en la plaza frente al colegio, tiene agua.",
  "telefono_contacto": "+5491144556677"
}
* Todos los campos son opcionales.

[POST] /scan/reclamar  [REQUIERE AUTH JWT]
Descripción: El usuario autenticado reclama un tag virgen y registra su mascota en 1 paso.
Headers:
  Authorization: Bearer <token>
Request Body (JSON):
{
  "token_o_codigo": "enc-8f12a4b3",
  "nombre_mascota": "Rocky",
  "especie": "Perro",
  "raza": "Labrador",
  "color": "Dorado",
  "foto_url": "https://miservidor.com/fotos/rocky.jpg",
  "notas_medicas": "Es sordo del oído derecho. Requiere medicación diaria.",
  "mensaje_personalizado": "¡Hola! Me llamo Rocky y estoy perdido, comunicate con mi familia.",
  "mostrar_telefono": true
}
* Campos obligatorios: token_o_codigo, nombre_mascota.


----------------------------------------------------------------------
3. MASCOTAS (/mascotas)
----------------------------------------------------------------------

[GET] /mascotas/
Descripción: Lista paginada (?page=1&size=50). No lleva body.

[GET] /mascotas/{id}
Descripción: Detalle de mascota con su Tag NFC y Dueño anidados. No lleva body.

[POST] /mascotas/
Descripción: Crea una mascota asociándola manualmente a un usuario y/o tag.
Request Body (JSON):
{
  "nombre": "Firulais",
  "especie": "Perro",
  "raza": "Mestizo",
  "color": "Marrón",
  "foto_url": "https://ejemplo.com/foto.jpg",
  "estado_extravio": "en_casa",
  "notas_medicas": "Alergia a pulgas",
  "mensaje_personalizado": "Por favor llámame si me encuentras",
  "mostrar_telefono": true,
  "mostrar_direccion": false,
  "recompensa": "Se ofrece recompensa",
  "estado": true,
  "tag_id": 1,
  "usuario_id": 1
}
* Campos obligatorios: nombre, especie, raza. tag_id y usuario_id son opcionales (IDs existentes).
* Valores posibles de estado_extravio: "en_casa", "perdido", "encontrado", "en_veterinaria", "en_adopcion".

[PUT] /mascotas/{id}
Descripción: Edita todos los datos de la mascota.
Request Body (JSON):
Mismo cuerpo que en [POST] /mascotas/.

[DELETE] /mascotas/{id}?logico=true
Descripción: Baja lógica (estado=false). Si logico=false borra de la DB. No lleva body.


----------------------------------------------------------------------
4. TAGS NFC (/tags)
----------------------------------------------------------------------

[GET] /tags/
Descripción: Lista paginada (?page=1&size=50). No lleva body.

[GET] /tags/{id}
Descripción: Detalle del tag con la Veterinaria y Mascota anidadas. No lleva body.

[POST] /tags/
Descripción: Alta de un nuevo tag / chapita (por la fábrica o veterinaria).
Request Body (JSON):
{
  "codigoQR": "QR-ENC-9001",
  "uidNFC": "NFC-04A1B2C3D4",
  "token_publico": "enc-auto1234",
  "precio": 5000,
  "activo": true,
  "estado": "disponible",
  "veterinaria_id": 1
}
* Campos obligatorios: codigoQR, uidNFC.
* token_publico: Opcional (si se omite, el backend genera uno único "enc-xxxxxxxx").
* Valores posibles de estado: "disponible", "reclamado", "extraviado", "inactivo".

[PUT] /tags/{id}
Descripción: Modifica datos del tag.
Request Body (JSON):
Mismo cuerpo que en [POST] /tags/.

[DELETE] /tags/{id}?logico=true
Descripción: Baja lógica (activo=false). No lleva body.


----------------------------------------------------------------------
5. USUARIOS (/usuarios)
----------------------------------------------------------------------

[GET] /usuarios/
Descripción: Lista paginada (?page=1&size=50). No lleva body.

[GET] /usuarios/{id}
Descripción: Detalle del usuario con la lista de sus mascotas. No lleva body.

[POST] /usuarios/
Descripción: Crea un usuario directamente desde el panel CRUD.
Request Body (JSON):
{
  "nombre": "Carlos Gómez",
  "email": "carlos@example.com",
  "contraseña": "password123",
  "telefono": "+5493512345678",
  "telefono_secundario": null,
  "direccion": "Bv. San Juan 450",
  "ciudad": "Córdoba",
  "rol": "dueno",
  "activo": true
}
* Campos obligatorios: nombre, email, contraseña.

[PUT] /usuarios/{id}
Descripción: Edita datos de contacto y perfil (la contraseña no se cambia acá).
Request Body (JSON):
{
  "nombre": "Carlos Gómez Editado",
  "email": "carlos_nuevo@example.com",
  "telefono": "+5493512345678",
  "telefono_secundario": "+5493519876543",
  "direccion": "Nueva dirección 123",
  "ciudad": "Córdoba",
  "rol": "dueno",
  "activo": true
}

[DELETE] /usuarios/{id}?logico=true
Descripción: Baja lógica (activo=false). No lleva body.


----------------------------------------------------------------------
6. VETERINARIAS (/veterinarias)
----------------------------------------------------------------------

[GET] /veterinarias/
Descripción: Lista paginada (?page=1&size=50). No lleva body.

[GET] /veterinarias/{id}
Descripción: Detalle con la lista de tags NFC asignados. No lleva body.

[POST] /veterinarias/
Descripción: Crea una veterinaria / punto de distribución.
Request Body (JSON):
{
  "nombre": "Veterinaria San Roque",
  "telefono": "0351-4889900",
  "activo": true
}
* Campos obligatorios: nombre, telefono.

[PUT] /veterinarias/{id}
Descripción: Edita la veterinaria.
Request Body (JSON):
Mismo cuerpo que en [POST] /veterinarias/.

[DELETE] /veterinarias/{id}?logico=true
Descripción: Baja lógica (activo=false). No lleva body.