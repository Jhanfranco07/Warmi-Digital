# Rendimiento de la primera carga online

## Alcance

Medicion del inicio de sesion real de Auth.js hasta el dashboard y de la primera
apertura interactiva de la Sesion 1 del Modulo 3. No se modificaron el paquete
offline, Service Worker, PDF, videos, contenido, esquema Prisma ni variables de
entorno. No se agregaron dependencias.

## Pruebas y resultados

Servidor local con build de produccion, Edge headless y viewport de 390 x 844,
con PostgreSQL configurado en Neon. Tres contextos nuevos por medicion. La
leccion usa un contexto sin cache de navegador que recibe solo la sesion en
memoria; se comprueba que el menu de temas responda al clic. No se usa una
sesion simulada ni se guardan credenciales, cookies o tokens en archivos.

Referencia anterior: codigo de `0c7a130164b890e7d148c7bd3398b8ff5c38a8b6`.

| Flujo                       | Antes, ms (3 muestras) | Despues, ms (3 muestras) | Mediana antes / despues |
| --------------------------- | ---------------------- | ------------------------ | ----------------------- |
| Login hasta dashboard       | 6474, 2167, 3239       | 3430, 2795, 2567         | 3239 / 2795 (-13,7%)    |
| Primera leccion interactiva | 6047, 4579, 4734       | 2064, 3716, 1925         | 4734 / 2064 (-56,4%)    |

La transferencia JavaScript de la leccion se mantiene en 23 peticiones y
265180 bytes codificados. Esta entrega optimiza trabajo del servidor y lecturas
de datos, no reduce el bundle del cliente.

El benchmark independiente de repositorios, con un usuario inscrito existente y
sin imprimir sus datos, encontro estas reducciones:

| Operacion                                 | Consultas antes | Consultas despues |
| ----------------------------------------- | --------------- | ----------------- |
| Datos criticos del dashboard              | 35              | 20                |
| Contadores y notificaciones de navegacion | 10 habituales   | 3                 |
| Lectura de leccion e inscripcion          | 10              | 7                 |
| Videos de apoyo de Sesion 2 para Sesion 1 | 11              | 3                 |

Las convocatorias ya no bloquean los datos criticos: el bloque realiza una
consulta adicional limitada a tres resultados y se transmite con Suspense.
La representacion JSON del resultado de apoyo paso de 89524 a 2596 bytes; esto
no es el peso de los MP4 ni del paquete offline.

Las latencias de PostgreSQL y de la primera conexion variaron entre ejecuciones.
Estas muestras no son un ensayo de carga concurrente, una medicion de Vercel
ni una prueba de que Neon se haya suspendido. Hubo una repeticion incompleta con
una espera de unos 15,6 segundos: la variabilidad de red/conexion sigue siendo
un riesgo y no debe ocultarse con las medianas de la ejecucion completa.

## Cambios aplicados

- `requireAuth` se memoiza con React `cache` dentro de cada render del servidor,
  evitando repetir la consulta de identidad y roles entre layout y pagina. No
  existe cache global de sesiones ni se omiten comprobaciones de acceso.
- El contador de conversaciones no leidas usa una consulta SQL parametrizada
  que examina el ultimo mensaje, sin cargar perfiles ni historiales completos.
- El dashboard deja de leer historias, productos, pedidos y notificaciones que
  no consume. El resumen formativo filtra el programa en SQL y omite perfiles
  de facilitadoras innecesarios para esta pantalla.
- La leccion conserva la comprobacion de inscripcion, pero omite relaciones no
  utilizadas. Los MP4 de apoyo se consultan por curso, modulo, leccion e
  inscripcion, conservando `LessonFile.position` y los registros existentes.
- Las convocatorias seleccionan solo ID, titulo y fecha, con limite en BD;
  las consultas completas de otras pantallas se conservan.

## Validaciones

- `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `pnpm exec prisma validate` y `git diff --check`.
- `pnpm test`: 75 pruebas, incluidas cinco de consultas y permisos relacionados.
- `pnpm exec tsx tests/navigation-count.integration.mjs`: compara el contador
  nuevo con el anterior en PostgreSQL; todos los fixtures se revierten mediante
  rollback, incluidos casos sin mensajes, mensaje propio y limites de lectura.
- `node tests/initial-load.browser.mjs after`: tres logins y primeras lecciones
  reales; una segunda cuenta sin inscripcion no recibe el contenido protegido y
  el acceso anonimo redirige al login. La denegacion se comprueba mediante HTTP
  con las cookies reales del contexto, evitando un fallo de Edge al navegar a
  la respuesta 404. Las cuentas temporales y su progreso se eliminan al terminar.

## Repetir las mediciones

Con el build de produccion ejecutandose en `http://localhost:3100`:

```powershell
pnpm exec tsx scripts/benchmark-initial-load.mjs local
$env:WARMI_PLAYWRIGHT_PATH = '<ruta a la instalacion existente de Playwright>'
node tests/initial-load.browser.mjs local
pnpm exec tsx tests/navigation-count.integration.mjs
```

`WARMI_TEST_URL` permite otro servidor local y `WARMI_BROWSER_CHANNEL` permite
otro canal Chromium instalado. El test de navegador crea cuentas temporales en
la BD configurada; no debe apuntarse a otro entorno sin revisar este efecto.
El benchmark de repositorios es de solo lectura. Los JSON sanitizados y las
capturas se guardan en el directorio temporal del sistema, no en el repositorio.
La etiqueta del benchmark solo identifica archivos; no restaura codigo anterior.

## Pendiente de produccion

Medir latencias p50/p95, conexiones frias y concurrencia en el despliegue real;
revisar region de Vercel respecto de Neon y configuracion del pool segun esas
mediciones. No se cambiaron planes, regiones ni indices especulativamente.
La compatibilidad offline en dispositivo fisico sigue siendo una validacion
distinta de esta mejora online.
