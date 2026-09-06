# Fit33 v9.1.0 — Entrenamiento inteligente

## Objetivo

Convertir el registro de entrenamientos en un sistema de progresión visible y medible.

## Incluido

- RIR y temporizador de descanso ya integrados en la sesión.
- Visualización de la carga sugerida por el motor adaptativo dentro de cada ejercicio.
- Motor puro de progresión: subir 2,5%, mantener o bajar 5% según rango de repeticiones y RIR.
- Estimación de 1RM mediante Epley.
- Página `/entrenos/records` con récords personales, mejor carga, mejor serie, 1RM estimado y volumen histórico.
- Tests unitarios del motor de progresión.
- Sin nueva tabla obligatoria en Supabase.

## Criterios

- Si todas las series llegan al extremo superior del rango con RIR medio >= 2: subir ~2,5%.
- Si alguna serie queda por debajo del mínimo con RIR medio <= 1: bajar ~5%.
- En cualquier otro caso: mantener y consolidar.
