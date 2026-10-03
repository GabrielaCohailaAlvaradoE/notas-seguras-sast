# Evidencias de la ejecución de referencia

- [Ejecución 37145288144](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37145288144).
- Commit analizado: `473d35f` (SHA completo en `ci-run.json`).
- Fecha: 3 de octubre de 2026, aproximadamente 13:44, Lima (UTC-5).
- Estado de `security` y `deploy`: satisfactorio.
- Los informes de esta carpeta se descargaron del artefacto `security-reports` de esa ejecución.
- Bearer CLI 2.1.1; ESLint 10.12.0; eslint-plugin-no-unsanitized 4.1.5; Node.js 24.

`summary.json` contiene los contadores: Bearer 2 altos en la baseline y 0 en `app/`; ESLint 3 errores en la baseline y 0 en `app/`. El análisis inicial abarca `examples/vulnerable/`; el final abarca `app/`.

Bearer no señaló el `eval` de la baseline. La regla `no-eval` de ESLint sí. Hay dos hallazgos coincidentes entre herramientas: no sumar los contadores como vulnerabilidades únicas.

Las cinco pruebas de regresión pasaron según el paso correspondiente de Actions. También se verificaron HTTP 200 del sitio público, creación de tareas e inserción literal de etiquetas en navegador. La persistencia al recargar se comprobó en el servidor local de la misma aplicación.

Estos datos representan una instantánea. Las ejecuciones posteriores generan nuevos informes en Actions; la retención del artefacto es de siete días. La copia versionada se conserva más allá de esa retención. Cero hallazgos no garantiza ausencia de vulnerabilidades.
