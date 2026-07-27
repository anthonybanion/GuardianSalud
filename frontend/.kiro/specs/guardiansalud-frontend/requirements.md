# GuardiánSalud Frontend — Requisitos

## Descripción del Producto
Aplicación web SPA para el control y seguimiento de medicamentos en asilos, estancias y centros de cuidado de pacientes. El objetivo central es garantizar un registro preciso de horarios, dosis, uso del medicamento y asignación por paciente, priorizando la **Privacidad desde el Diseño**.

---

## Requisitos Funcionales

### RF-01: Autenticación y Control de Acceso por Rol

- **RF-01.1** El sistema debe permitir iniciar sesión con correo electrónico y contraseña.
- **RF-01.2** Deben existir exactamente 3 roles: `admin`, `medico`, `enfermero`.
- **RF-01.3** Cada rol debe tener acceso únicamente a las secciones permitidas (ver RF-02 al RF-06).
- **RF-01.4** La sesión activa debe persistir al recargar la página.
- **RF-01.5** El usuario debe poder cerrar sesión desde cualquier pantalla.
- **RF-01.6** Al iniciar sesión, el sistema debe redirigir al usuario a su primera tab permitida.

### RF-02: Registros Base (solo Admin)

#### RF-02.1: Medicamentos
- **RF-02.1.1** El admin puede registrar medicamentos con: nombre comercial, fórmula/principio activo, concentración, presentación, vía de administración y stock actual.
- **RF-02.1.2** El sistema debe mostrar un catálogo de medicamentos registrados con su estado de stock (semáforo: crítico/bajo/normal).
- **RF-02.1.3** Los campos obligatorios son: nombre, fórmula, presentación y vía.

#### RF-02.2: Residentes / Pacientes
- **RF-02.2.1** El admin puede registrar residentes con: identificador/apodo (sin nombre real), ubicación/habitación, condición/padecimiento, dieta, alergias médicas y cuidados especiales.
- **RF-02.2.2** El campo de alergias debe ser prominente visualmente y marcado como crítico.
- **RF-02.2.3** El campo obligatorio es: apodo/identificador.
- **RF-02.2.4** El sistema no debe solicitar ni almacenar nombre real, fecha de nacimiento, ni CURP del residente (Privacy by Design).

#### RF-02.3: Personal / Cuidadores
- **RF-02.3.1** El admin puede registrar personal con: nombre completo, rol (Enfermero/Cuidador/Médico/Auxiliar), especialidades y turno preferente.
- **RF-02.3.2** Las especialidades se seleccionan de un listado predefinido con toggle.
- **RF-02.3.3** Los campos obligatorios son: nombre, rol y turno preferente.

### RF-03: Cuidadores y Turnos (Admin + Médico)

- **RF-03.1** Se puede asignar a un miembro del personal a un turno (Matutino/Vespertino/Nocturno/Planta), zona de cobertura y fecha.
- **RF-03.2** La vista principal muestra la plantilla del día organizada por turno, con el personal asignado y su zona.
- **RF-03.3** Los campos obligatorios son: colaborador, turno y zona.

### RF-04: Asignación de Dosis (Admin + Médico)

- **RF-04.1** Se puede programar una dosis indicando: residente, medicamento, frecuencia, hora de inicio, cuidador responsable y nivel de criticidad.
- **RF-04.2** El sistema debe mostrar las alergias del residente seleccionado como advertencia visual.
- **RF-04.3** Si el medicamento contiene un componente al que el residente es alérgico, el sistema debe **bloquear completamente** la asignación con alerta visual y deshabilitar el botón de guardar.
- **RF-04.4** Las dosis de alta criticidad deben requerir confirmación especial en la ejecución (marcador visual).
- **RF-04.5** Los campos obligatorios son: residente, medicamento, frecuencia y cuidador responsable.

### RF-05: Agenda del Turno (Admin + Médico + Enfermero)

- **RF-05.1** El enfermero ve todas las dosis programadas de su turno con: residente, medicamento, vía, hora, cuidador responsable y frecuencia.
- **RF-05.2** Cada dosis puede marcarse como **APLICADO** o **NO APLICADO**.
- **RF-05.3** Al marcar como NO APLICADO, el sistema debe solicitar un motivo de omisión obligatorio.
- **RF-05.4** Al confirmar cualquier acción (aplicar o omitir), se genera automáticamente una entrada en la bitácora.
- **RF-05.5** La vista debe mostrar un resumen del turno: total de dosis, aplicadas, pendientes, omitidas y porcentaje de avance.
- **RF-05.6** Si hay dosis de alta criticidad pendientes, el sistema debe mostrar un banner de alerta.
- **RF-05.7** El sistema debe mostrar notas contextuales (Kiro AI Semaforito) con instrucciones de administración específicas por medicamento.
- **RF-05.8** El enfermero debe poder cerrar el turno y generar un reporte de resumen.

### RF-06: Bitácora de Auditoría (Admin + Médico)

- **RF-06.1** La bitácora muestra el historial completo de dosis aplicadas y omitidas.
- **RF-06.2** Cada entrada muestra: fecha, hora, residente, medicamento, cuidador, estado y nota opcional.
- **RF-06.3** Se puede filtrar la bitácora por fecha, residente y cuidador firmante.
- **RF-06.4** La bitácora es de **solo lectura** — no se puede editar ni eliminar ninguna entrada.
- **RF-06.5** Al limpiar filtros, se deben restaurar todos los registros.

---

## Requisitos No Funcionales

### RNF-01: Privacidad desde el Diseño
- Los residentes se identifican solo por apodo o código, nunca por nombre real.
- Las alergias están marcadas visualmente como campo crítico.
- El sistema advierte al usuario que los datos se almacenan localmente (modo demo).

### RNF-02: Experiencia de Usuario
- La interfaz debe funcionar en modo claro y oscuro (dark mode).
- La navegación debe ser responsive: funcional en móvil, tablet y escritorio.
- Los formularios deben mostrar confirmación visual al guardar exitosamente.
- Las acciones destructivas o de alta criticidad deben requerir confirmación explícita.

### RNF-03: Rendimiento
- La aplicación debe cargar en menos de 3 segundos en red rápida.
- Las validaciones (ej. alergias) deben ejecutarse en tiempo real, sin delay perceptible.

### RNF-04: Accesibilidad
- Los formularios deben tener labels asociados correctamente.
- Los estados de error y éxito deben comunicarse con texto, no solo color.
- El contraste de colores debe cumplir WCAG AA.

### RNF-05: Integración con Supabase (próxima fase)
- Toda la capa de datos debe poder migrarse de estado en memoria a llamadas Supabase sin cambiar los componentes de UI.
- El store (`store.tsx`) será el único punto de modificación para la integración.
- Se debe implementar Row Level Security por rol en todas las tablas.
