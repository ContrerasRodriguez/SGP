const COMMON_PRIORITY = 2;

function issue(key, title, objective, deliverables, done, options = {}) {
  return {
    key,
    title,
    priority: options.priority ?? COMMON_PRIORITY,
    dueDate: options.dueDate ?? null,
    milestone: options.milestone ?? null,
    dependencies: options.dependencies ?? [],
    description: [
      `## Objetivo\n${objective}`,
      `## Entregables\n${deliverables.map((item) => `- ${item}`).join("\n")}`,
      `## Criterio de término\n${done}`,
    ].join("\n\n"),
  };
}

export const templates = [
  {
    id: "strategic-plan-90-days",
    name: "Plan estratégico · Primeros 90 días",
    organization: "Pequeños Creadores",
    description: "Seis frentes para instalar control comercial, financiero, organizacional y operativo.",
    issues: [
      issue(
        "commercial-offer",
        "Definir oferta comercial, tarifas y capacidad",
        "Definir una oferta simple, clara y rentable que pueda comunicarse y venderse de manera consistente.",
        ["Programas definitivos", "Jornadas y modalidades", "Cupos por nivel", "Tarifas oficiales", "Política de descuentos", "Condiciones de bolsas de horas", "Documento comercial versión 1"],
        "Cualquier integrante del equipo puede explicar correctamente los servicios, precios, cupos y condiciones.",
        { milestone: "Claridad y control" }
      ),
      issue(
        "financial-model",
        "Construir modelo financiero y punto de equilibrio",
        "Conocer el costo real de operar, el número de matrículas necesarias y la rentabilidad de cada programa.",
        ["Estructura de costos", "Costo por niño", "Margen por programa", "Punto de equilibrio", "Presupuesto mensual", "Flujo de caja de 13 semanas"],
        "La dirección puede proyectar caja y tomar decisiones de precios, dotación y capacidad con datos.",
        { dependencies: ["commercial-offer"], milestone: "Claridad y control" }
      ),
      issue(
        "executive-dashboard",
        "Implementar tablero ejecutivo de indicadores",
        "Crear un sistema breve de indicadores para revisar semanalmente el estado del negocio.",
        ["KPIs financieros", "KPIs comerciales", "KPIs operativos", "KPIs pedagógicos", "Fuentes de datos", "Rutina semanal de actualización"],
        "La reunión semanal usa un único tablero actualizado para tomar decisiones.",
        { dependencies: ["commercial-offer", "financial-model"], milestone: "Claridad y control" }
      ),
      issue(
        "enrollment-system",
        "Implementar sistema comercial y de matrículas",
        "Instalar un proceso único y medible desde el primer contacto hasta la matrícula o cierre del lead.",
        ["Embudo comercial", "Tiempos de respuesta", "Guiones", "Formulario y agenda", "Seguimiento post-visita", "Métricas de conversión"],
        "Ningún prospecto queda sin responsable, próxima acción, estado y fecha de seguimiento.",
        { dependencies: ["commercial-offer"], milestone: "Comercialización y procesos" }
      ),
      issue(
        "organization-design",
        "Definir organigrama, cargos y responsabilidades",
        "Clarificar quién decide, ejecuta, supervisa e informa en cada área crítica.",
        ["Organigrama", "Perfiles de cargo", "Responsables únicos", "Matriz RACI", "Cadencia de reuniones", "Límites de autoridad"],
        "Cada proceso crítico tiene un responsable conocido y no depende de instrucciones informales de los fundadores.",
        { milestone: "Comercialización y procesos" }
      ),
      issue(
        "critical-processes",
        "Documentar procesos operativos críticos",
        "Estandarizar la operación diaria para reducir errores y dependencia de personas específicas.",
        ["Mapa de procesos", "Procedimientos prioritarios", "Checklists", "Protocolos de incidentes", "Responsables", "Control de versiones"],
        "Los procesos críticos pueden ejecutarse y verificarse siguiendo documentación vigente.",
        { dependencies: ["organization-design"], milestone: "Adopción y delegación" }
      ),
    ],
  },
  {
    id: "pedagogical-planning",
    name: "Planificación pedagógica",
    organization: "Pequeños Creadores",
    description: "Diseño, preparación, ejecución, registro y evaluación de experiencias pedagógicas.",
    issues: [
      issue("learning-goals", "Definir propósitos y trayectorias", "Definir los aprendizajes observables de la planificación.", ["Propósitos", "Ejes experienciales", "Trayectorias principales y secundarias", "Indicadores observables"], "La planificación tiene objetivos coherentes y observables."),
      issue("activity-design", "Diseñar experiencias por nivel", "Crear experiencias diferenciadas para cada edad.", ["Actividades para 2, 3 y 4 años", "Materiales", "Preparación", "Secuencia", "Preguntas", "Adaptaciones"], "Cada experiencia está lista para ser implementada."),
      issue("materials", "Preparar ambientes y materiales", "Asegurar que el ambiente actúe como tercer educador.", ["Checklist de materiales", "Distribución del espacio", "Provocación inicial", "Medidas de seguridad"], "Ambiente y materiales están preparados antes de la ejecución."),
      issue("documentation", "Registrar documentación pedagógica", "Recoger evidencias relevantes del proceso de aprendizaje.", ["Observaciones", "Fotografías autorizadas", "Producciones", "Voces de los niños", "Registro por trayectoria"], "Existe evidencia suficiente y ordenada de la experiencia."),
      issue("evaluation", "Evaluar y ajustar la planificación", "Analizar evidencias y decidir próximos pasos.", ["Evaluación formativa", "Cobertura de trayectorias", "Ajustes por nivel", "Próximas experiencias"], "Los próximos pasos se fundamentan en registros observables."),
    ],
  },
  {
    id: "marketing-campaign",
    name: "Campaña de marketing",
    organization: "Pequeños Creadores",
    description: "Planificación y ejecución de una campaña multicanal orientada a matrículas.",
    issues: [
      issue("brief", "Definir brief y objetivo de campaña", "Alinear propósito, audiencia, oferta y resultado esperado.", ["Objetivo", "Audiencia", "Propuesta de valor", "Oferta", "Presupuesto", "KPIs"], "El brief está aprobado y permite producir la campaña."),
      issue("assets", "Producir mensajes y piezas", "Crear los contenidos necesarios para cada canal.", ["Mensajes", "Piezas gráficas", "Videos", "Landing page", "Mensajes de WhatsApp"], "Todas las piezas están aprobadas y listas para publicación."),
      issue("tracking", "Configurar medición y atribución", "Medir correctamente el recorrido desde anuncio hasta visita o matrícula.", ["UTMs", "Eventos", "Conversiones", "Panel de resultados", "Convenciones de nombres"], "Las conversiones pueden atribuirse a campaña, grupo y anuncio."),
      issue("launch", "Lanzar y monitorear campaña", "Publicar la campaña y controlar desempeño inicial.", ["Calendario", "Publicación", "Control diario", "Registro de incidencias"], "La campaña está activa sin errores críticos."),
      issue("optimization", "Optimizar y documentar aprendizajes", "Mejorar resultados y conservar lo aprendido.", ["Análisis", "Pruebas", "Ajustes", "Informe final", "Recomendaciones"], "Existe una decisión documentada sobre continuar, ajustar o cerrar."),
    ],
  },
  {
    id: "google-ads",
    name: "Google Ads · Captación",
    organization: "Pequeños Creadores",
    description: "Configuración, lanzamiento y optimización de campañas de búsqueda orientadas a visitas.",
    issues: [
      issue("measurement", "Configurar conversiones y medición", "Asegurar que formularios, WhatsApp y reservas se midan correctamente.", ["Google Tag", "Conversiones", "UTMs", "Pruebas", "Panel"], "Cada conversión relevante se registra una sola vez."),
      issue("keywords", "Investigar palabras clave y exclusiones", "Identificar búsquedas con intención real y reducir tráfico irrelevante.", ["Palabras clave", "Concordancias", "Negativas", "Segmentación local"], "La estructura de palabras clave está aprobada."),
      issue("campaigns", "Construir campañas y anuncios", "Crear una estructura clara por servicio e intención.", ["Campañas", "Grupos", "Anuncios", "Extensiones", "Presupuesto"], "Las campañas cumplen el checklist previo al lanzamiento."),
      issue("landing", "Alinear landing y formularios", "Mejorar continuidad entre búsqueda, anuncio y conversión.", ["Mensaje", "CTA", "Formulario", "WhatsApp", "Pruebas móviles"], "La experiencia completa funciona en computador y móvil."),
      issue("optimization", "Optimizar presupuesto y conversiones", "Ajustar inversión según resultados reales.", ["Términos de búsqueda", "CPC", "CTR", "Tasa de conversión", "Costo por lead", "Decisiones semanales"], "La campaña tiene una rutina semanal de optimización documentada."),
    ],
  },
  {
    id: "software-development",
    name: "Desarrollo de software",
    organization: "General",
    description: "Ciclo de definición, construcción, prueba y liberación de una funcionalidad.",
    issues: [
      issue("requirements", "Definir problema, alcance y criterios", "Acordar qué problema se resolverá y qué queda fuera.", ["Historia de usuario", "Alcance", "Criterios de aceptación", "Riesgos", "Dependencias"], "Los criterios permiten construir y probar sin ambigüedad."),
      issue("design", "Diseñar solución técnica y experiencia", "Definir arquitectura, datos, interfaz y decisiones relevantes.", ["Diseño funcional", "Modelo de datos", "API", "Flujos", "Decisiones técnicas"], "La solución está revisada antes de comenzar el desarrollo."),
      issue("implementation", "Implementar funcionalidad", "Construir la solución con cambios pequeños y revisables.", ["Código", "Migraciones", "Validaciones", "Manejo de errores", "Documentación"], "La funcionalidad cumple los criterios en ambiente local."),
      issue("quality", "Probar seguridad, calidad y regresiones", "Verificar comportamiento esperado y efectos secundarios.", ["Pruebas automáticas", "Pruebas manuales", "Accesibilidad", "Seguridad", "Regresión"], "No existen fallas críticas conocidas."),
      issue("release", "Liberar y monitorear", "Desplegar de forma controlada y comprobar el resultado.", ["Plan de despliegue", "Respaldo", "Monitoreo", "Plan de reversión", "Notas"], "La funcionalidad está operativa y monitoreada."),
    ],
  },
  {
    id: "infrastructure",
    name: "Proyecto de infraestructura",
    organization: "General",
    description: "Diseño, presupuesto, construcción y recepción de una mejora física.",
    issues: [
      issue("requirements", "Levantar requisitos y restricciones", "Comprender uso, seguridad, capacidad, espacio y normativa aplicable.", ["Medidas", "Usuarios", "Restricciones", "Riesgos", "Criterios de aceptación"], "Los requisitos están documentados y aprobados."),
      issue("design", "Desarrollar diseño y especificaciones", "Transformar los requisitos en una solución construible.", ["Planos", "Materiales", "Detalles", "Drenaje o instalaciones", "Seguridad"], "El diseño está listo para cotizar y ejecutar."),
      issue("budget", "Cotizar y aprobar presupuesto", "Comparar alternativas y asegurar viabilidad económica.", ["Cantidades", "Cotizaciones", "Cronograma", "Contingencia", "Aprobación"], "Existe presupuesto aprobado y responsable de compra."),
      issue("execution", "Ejecutar y controlar obra", "Construir con seguimiento de calidad, plazo y seguridad.", ["Plan de trabajo", "Registro de avance", "Control de cambios", "Inspecciones"], "La obra se completa según especificaciones aprobadas."),
      issue("handover", "Recibir, documentar y mantener", "Verificar la entrega y definir mantenimiento.", ["Checklist de recepción", "Correcciones", "Garantías", "Manual de mantenimiento"], "El espacio está habilitado y cuenta con plan de mantenimiento."),
    ],
  },
  {
    id: "human-resources",
    name: "Recursos Humanos",
    organization: "General",
    description: "Diseño de cargo, selección, incorporación y seguimiento de una persona.",
    issues: [
      issue("role", "Definir cargo y resultado esperado", "Aclarar propósito, funciones, autoridad y métricas del cargo.", ["Perfil", "Responsabilidades", "Competencias", "Jornada", "Indicadores"], "El perfil está aprobado y alineado con el organigrama."),
      issue("recruitment", "Ejecutar búsqueda y selección", "Atraer y evaluar candidatos de forma consistente.", ["Publicación", "Filtro", "Entrevistas", "Referencias", "Decisión"], "Existe una decisión documentada y trazable."),
      issue("contracting", "Formalizar contratación", "Completar documentación y condiciones antes del ingreso.", ["Oferta", "Contrato", "Antecedentes", "Políticas", "Accesos"], "La contratación está completa antes del inicio."),
      issue("onboarding", "Implementar incorporación de 30 días", "Acelerar comprensión del rol, cultura y procesos.", ["Plan de inducción", "Capacitaciones", "Responsable", "Metas iniciales"], "La persona puede ejecutar sus funciones básicas con autonomía."),
      issue("review", "Evaluar adaptación y desempeño inicial", "Revisar resultados, brechas y apoyos requeridos.", ["Evaluación", "Feedback", "Plan de mejora", "Decisión de continuidad"], "La evaluación inicial está realizada y comunicada."),
    ],
  },
  {
    id: "namaspet-commercial",
    name: "NamasPet · Campaña comercial",
    organization: "NamasPet",
    description: "Campaña de reactivación y venta por WhatsApp, web y tienda física.",
    issues: [
      issue("segments", "Segmentar clientes y oportunidades", "Priorizar clientes según historial, recencia, frecuencia y necesidades de sus mascotas.", ["Base depurada", "Segmentos", "Criterios", "Prioridades"], "Cada contacto pertenece a un segmento accionable."),
      issue("offer", "Definir ofertas y productos prioritarios", "Construir propuestas rentables y relevantes para cada segmento.", ["Productos", "Márgenes", "Combos", "Beneficios", "Stock disponible"], "Las ofertas tienen margen y stock validados."),
      issue("messages", "Crear secuencias de WhatsApp", "Diseñar contacto inicial y seguimiento sin saturar a los clientes.", ["Mensajes", "Respuestas rápidas", "Calendario", "Reglas de seguimiento"], "El equipo puede ejecutar la campaña con mensajes aprobados."),
      issue("execution", "Ejecutar campaña y registrar respuestas", "Contactar, vender y mantener trazabilidad.", ["Envíos", "Seguimientos", "Pedidos", "Motivos de rechazo", "Estado de cada cliente"], "Todos los contactos tienen resultado o próxima acción."),
      issue("results", "Analizar ventas y aprendizajes", "Medir rentabilidad y definir la siguiente campaña.", ["Ventas", "Margen", "Conversión", "Ticket promedio", "Recompra", "Recomendaciones"], "Existe informe final con decisiones concretas."),
    ],
  },
];

export function getTemplate(templateId) {
  return templates.find((template) => template.id === templateId) || null;
}

export function renderTemplate(template, variables = {}) {
  const replacements = Object.entries(variables);
  const replace = (value) => {
    if (typeof value !== "string") return value;
    return replacements.reduce(
      (text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement ?? "")),
      value
    );
  };

  return {
    ...template,
    issues: template.issues.map((item) => ({
      ...item,
      title: replace(item.title),
      description: replace(item.description),
      dueDate: replace(item.dueDate),
    })),
  };
}
