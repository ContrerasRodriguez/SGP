# Generador de proyectos para Linear

Módulo de SGP para convertir plantillas de gestión en issues de Linear de manera controlada.

## Alcance de la primera versión

- Plantillas reutilizables para:
  - Plan estratégico de 90 días.
  - Planificaciones pedagógicas.
  - Marketing.
  - Google Ads.
  - Desarrollo de software.
  - Infraestructura.
  - Recursos Humanos.
  - NamasPet.
- Vista previa antes de crear información.
- Creación masiva de issues en un proyecto existente.
- Asignación de prioridad y milestone cuando existe una coincidencia por nombre.
- Prevención de duplicados mediante marcadores internos en la descripción.
- API key de Linear almacenada únicamente en el servidor.

## Configuración

1. Copiar `server/.env.linear-generator.example` a `server/.env` o incorporar sus variables al entorno de despliegue.
2. Crear una API key personal en Linear y asignarla a `LINEAR_API_KEY`.
3. Mantener `LINEAR_DEFAULT_PROJECT_ID` y `LINEAR_DEFAULT_TEAM_ID` con los valores del proyecto predeterminado, o ingresar otros IDs desde la interfaz.
4. En el frontend, configurar opcionalmente:

```env
VITE_LINEAR_GENERATOR_API_BASE=http://localhost:3001
```

## Ejecución local

Terminal 1:

```bash
cd server
npm install
npm run dev
```

Terminal 2:

```bash
cd server
npm run dev:linear-generator
```

Terminal 3:

```bash
cd web
npm install
npm run dev
```

Abrir SGP y entrar en **Generador Linear**.

## Flujo de uso

1. Seleccionar una plantilla.
2. Revisar el Project ID y Team ID de destino.
3. Revisar títulos, descripciones, milestones y dependencias lógicas.
4. Marcar la confirmación.
5. Presionar **Crear issues en Linear**.
6. Revisar los enlaces de los issues creados.

Una segunda ejecución de la misma plantilla no vuelve a crear los issues existentes, porque cada issue contiene un marcador técnico único.

## Seguridad

- No guardar `LINEAR_API_KEY` en archivos del frontend.
- No publicar el archivo `.env`.
- Ejecutar primero una vista previa.
- Usar una API key asociada a una cuenta con permisos limitados al workspace necesario.
- Rotar la clave si llega a exponerse.

## Próximas capacidades

- Crear proyectos nuevos desde plantillas.
- Crear milestones automáticamente.
- Resolver dependencias como relaciones reales entre issues.
- Asignar responsables por plantilla.
- Añadir fechas relativas desde la fecha de inicio del proyecto.
- Registrar auditoría de cada ejecución en SQLite.
- Permitir plantillas editables desde la interfaz.
