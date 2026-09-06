## v8.1.0 — Biblioteca, Perfil y Automatización

- Biblioteca ampliada de ejercicios por grupos musculares.
- Editor de perfil funcional con persistencia en Supabase.
- El perfil muestra preferencias reales guardadas.
- El Coach Adaptativo puede aplicar y guardar planes confirmados.

## [8.0.0] - Coach Adaptativo 2.0

- Añadido centro de decisiones del Coach Autónomo.
- Añadidas vistas previas de reorganización, reducción de sesión, nutrición y recuperación.
- Añadida confirmación explícita antes de continuar con una propuesta.
- Mantenida la compatibilidad con Adaptive Engine y rutinas alternas.

# Changelog

## 7.0.0 - Coach Autónomo

- Motor proactivo de propuestas.
- Recovery, adherencia y nutrición conectados al Coach.
- Nueva ruta `/coach/autonomo`.
- Confirmación explícita antes de cualquier cambio.

# Fit33 v5.0.0 — Rotación inteligente de rutinas

- 3 variantes por cada tipo de entrenamiento.
- Rotación automática semanal A → B → C → A.
- Mantiene el mismo reparto semanal y objetivos musculares.
- Añade test automático para comprobar la rotación.

## [3.0.0]

### Added

- Pantalla Hoy contextual con entrenamiento, nutrición, hidratación, Coach y XP.
- Coach conversacional privado basado en reglas y datos reales.
- Planificador semanal automático.
- Registro diario de agua.
- Objetivos y preferencias persistentes por usuario.
- Configuración y prueba local de notificaciones web.
- Nuevas rutas `/coach/chat`, `/planificacion` y `/perfil/notificaciones`.
- Migración `006_v3_platform.sql` con políticas RLS.
- Tests del planificador y del Coach conversacional.

### Notes

- El chat no usa todavía un proveedor externo de IA.
- Las notificaciones programadas con la app cerrada necesitan Web Push.
- Apple Health requiere una integración nativa, no disponible directamente desde una PWA.

## [2.0.0]

### Added

- Informe semanal ampliado del Coach Fit33.
- Sistema de logros, nivel y puntos.
- Fotos privadas de progreso en Supabase Storage.
- Nueva experiencia de progreso con línea temporal.
- Migración `005_smart_progress.sql`.

# Changelog

## [1.2.2]

### Added

- Modo offline para finalizar entrenamientos.
- Cola persistente con IndexedDB.
- Sincronización automática al recuperar conexión.
- Service worker y página `/offline`.
- Indicador global de conexión y pendientes.
- Idempotencia mediante `client_id`.
- Test de deduplicación de la cola offline.

## [1.2.1]

### Added

- Manifiesto PWA para Fit33.
- Iconos F33 para iPhone y navegadores.
- Metadatos Apple Web App y modo standalone.
- Página de instalación `/instalar`.
- Compatibilidad con zonas seguras del iPhone.

## [1.1.1]

### Added

- Módulo base de nutrición.
- Registro diario de comidas con calorías, proteína, hidratos, grasas y fibra.
- Resumen diario frente a objetivos personales.
- Agrupación de registros por tipo de comida.
- Eliminación segura de registros nutricionales.
- Tablas `foods`, `nutrition_logs` y `meal_templates` con RLS por usuario.
- Pruebas unitarias para el cálculo de totales nutricionales.

## [0.9.2]

### Added

- Dashboard PRO integrado en la página de inicio.
- Resumen semanal de sesiones, volumen, duración y series.
- Comparaciones con la semana anterior.
- Foco muscular y marcas recientes.
- Primeras recomendaciones automáticas del Coach Fit33.
- Accesos directos a entrenamiento y analíticas.

## [0.9.1]

### Added

- Motor analítico de entrenamientos.
- Comparación semanal de sesiones, volumen y duración.
- Resumen mensual.
- Distribución por grupo muscular.
- Referencias de rendimiento y 1RM estimado.
- Página `/analiticas`.

## [0.8.3]

### Added

- Historial profesional con resumen acumulado.
- Página de detalle para cada sesión.
- Desglose completo de ejercicios y series.
- Comparación de volumen, carga máxima y series con la sesión anterior del mismo tipo.
- Navegación directa desde cada tarjeta del historial.

## [0.8.2]

### Added

- Workout Session Manager.
- Cronómetro preciso basado en marcas de tiempo.
- Pausa y reanudación de sesión.
- Descanso automático de 90 segundos al completar una serie.
- Controles para ampliar o cancelar el descanso.
- Autosave del formulario cada cinco segundos.
- Recuperación opcional tras recargar o cerrar el navegador.
- Vibración compatible al finalizar el descanso.
- Cancelación de sesión con limpieza del borrador.

## [0.8.1]

### Added

- Guardado completo de workouts, exercises y sets.
- Resumen al finalizar el entrenamiento.
- Historial inicial de sesiones.

## [0.7.6]

### Added

- Documentación y roadmap del proyecto.

## [0.7.5]

### Added

- ESLint, Prettier, Husky, lint-staged y GitHub Actions.

## [0.6.0]

### Added

- Autenticación y aislamiento de datos por usuario mediante RLS.

## [3.1.0]

### Added

- Generador semanal de menús adaptado a objetivos, alergias y preferencias.
- Recetas con cantidades, macros y preparación.
- Lista de la compra automática, agrupada y editable.
- Persistencia de menús y listas mediante Supabase con RLS.
- Tests unitarios del planificador nutricional.

## [5.0.0]

### Added

- Base nativa iOS mediante Capacitor.
- Conexión con Apple Health/HealthKit.
- Sincronización de pasos, sueño, pulso, peso, calorías activas y entrenamientos.
- Nueva pantalla `/salud`.
- Persistencia privada de agregados diarios con RLS.
- Plantilla Swift e instrucciones de Xcode.

## [4.0.0]

### Added

- Check-in diario y puntuación de recuperación.
- Planificador adaptativo según fatiga y recuperación.
- Proveedor opcional de OpenAI para el Coach conversacional.
- Fallback automático al motor privado de reglas.
- Nueva ruta `/recuperacion`.
- Test unitario del motor de recuperación.
- Migración `008_v4_intelligence.sql` con RLS.

### Changed

- Logo e iconos de Fit33 con colores invertidos.
- La pantalla Hoy muestra recuperación y adaptación semanal.
- La planificación indica sesiones de volumen reducido.
- Versión del proyecto actualizada a 4.0.0.

## [5.0.0-web]

### Added

- Predicción orientativa de fecha de objetivo de peso.
- Proyección de fuerza a cuatro semanas por ejercicio.
- Retos semanales de entrenamiento, proteína, hidratación y recuperación.
- Nuevas rutas `/predicciones` y `/retos`.
- Integración de predicciones y retos en la pantalla Hoy.
- Tests unitarios para predicciones y retos.

### Changed

- Apple Health queda preparado pero pospuesto hasta disponer de un entorno Mac/Xcode.

## v6.0.0 — Adaptive Engine

- Nuevo motor adaptativo de entrenamiento.
- Progresión automática de cargas según rendimiento reciente.
- Ajuste de carga según recuperación.
- Dashboard y navegación con acceso a Adaptive.
- Nueva ruta `/adaptativo`.
