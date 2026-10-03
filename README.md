# Notas Seguras

Aplicación académica de tareas personales para comparar análisis estático con **Bearer CLI 2.1.1** y **ESLint 10.12.0 + eslint-plugin-no-unsanitized 4.1.5**, corregir los hallazgos y desplegar automáticamente en GitHub Pages.

Autores: Gabriela Estefania Cohaila Alvarado y Jhony Vargas Luque.

- [Aplicación pública](https://GabrielaCohailaAlvaradoE.github.io/notas-seguras-sast/)
- [Ejecuciones de GitHub Actions](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions)
- [Workflow](.github/workflows/security-and-deploy.yml)
- [Evidencia del análisis](evidence/)
- [Material para los artículos y la exposición](docs/)

## Qué hace la aplicación

Crea tareas con título, descripción, minutos y prioridad; permite buscar, filtrar, completar y eliminar. Guarda los datos en `localStorage` del navegador. Es una aplicación estática, sin servidor de negocio, cuentas ni sincronización. No debe usarse para almacenar datos sensibles.

## Resultado observado

| Analizador | Componentes vulnerables | Aplicación corregida |
|---|---:|---:|
| Bearer CLI | 2 hallazgos altos de XSS | 0 |
| ESLint con reglas de seguridad | 3 errores: 2 innerHTML y 1 eval | 0 |
| Pruebas de regresión | No aplica | 5 aprobadas |

Los dos analizadores señalan las mismas dos inserciones HTML; **no son cinco vulnerabilidades diferentes**. Bearer no detectó el `eval` en este ejemplo, y ESLint sí. Los resultados corresponden a esta versión y configuración, no a una certificación de ausencia de vulnerabilidades.

`examples/vulnerable/` conserva las implementaciones inseguras de tres funciones para comparar; no es un producto anterior ni una aplicación vulnerable desplegada. `app/` contiene las funciones corregidas y la aplicación completa. Se modificaron `innerHTML` por `textContent` y `eval` por validación de enteros y conversión con `Number`.

## Ejecutar localmente

Requisito: Node.js 24.

```bash
npm ci
npm test
npm run scan:eslint
npm start
```

Abrir http://127.0.0.1:4173. Para construir: `npm run build`.

## Reproducir Bearer

Linux x86_64 o Ubuntu en WSL, con `curl`, `tar` y `sha256sum`. Desde la raíz del repositorio:

```bash
bash scripts/install-bearer.sh
bash scripts/scan-bearer.sh
node scripts/summarize.mjs
```

La instalación descarga la versión oficial y comprueba su SHA256 con el archivo de sumas de la misma publicación. Los informes se escriben en `reports/`. El análisis de la baseline espera código 1 por hallazgos; el análisis de `app/` debe finalizar en 0. No se fuerza éxito sobre la aplicación publicable.

Para ver el informe directamente:

```bash
.tools/bearer/bearer scan examples/vulnerable --disable-version-check
.tools/bearer/bearer scan app --disable-version-check
```

## Automatización y publicación

Un push a `main` ejecuta pruebas, ambos analizadores, el resumen, la construcción y el despliegue. Las solicitudes de cambio ejecutan los controles sin desplegar. El trabajo `deploy` depende de `security` mediante `needs`, por lo que un fallo impide la nueva publicación. El sitio anterior puede seguir disponible si un despliegue posterior falla.

En GitHub: Settings → Pages → Source → GitHub Actions. Se usa un repositorio público y runners estándar `ubuntu-latest`. No se configura una suscripción, servicio de pago ni secreto de proveedor. GitHub Pages es el proveedor SaaS público solicitado.

El artefacto publicado incluye únicamente seis archivos de `app/`; la baseline, los scripts y `node_modules` no se publican. Las acciones están fijadas por SHA; las herramientas de Node por versión y lockfile. Los informes de Actions se conservan siete días; `evidence/` conserva una instantánea en el repositorio.

## Prueba visual para la exposición

Agregar como título `<b>Prueba de texto</b>`. Debe aparecer literalmente, sin convertirse en negrita. Buscar la tarea, completarla y recargar para comprobar persistencia. Esta comprobación ilustra la inserción como texto; no sustituye una auditoría completa.

## Herramientas distintas a los laboratorios

La revisión de las guías SI784 compartidas identificó SonarQube/SonarCloud en lab01, Snyk en lab02, Semgrep en lab03 y tfsec/SonarCloud en lab04. Bearer y las reglas de seguridad de ESLint no aparecen en esas cuatro guías. Esta comparación se limita al material revisado.

## Fuentes oficiales

- [Catálogo OWASP de analizadores de código](https://community.owasp.org/Source_Code_Analysis_Tools) — incluye Bearer CLI; la inclusión no implica aval o certificación.
- [Catálogo NIST de analizadores](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers).
- [Bearer CLI](https://docs.bearer.com/) y [regla de inserción HTML](https://docs.bearer.com/reference/rules/javascript_lang_dangerous_insert_html/).
- [Plugin de Mozilla](https://github.com/mozilla/eslint-plugin-no-unsanitized) y [regla no-eval](https://eslint.org/docs/latest/rules/no-eval).
- [Despliegue personalizado en Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Uso y costos de Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Alcance

Solo se analiza código propio. Los hallazgos son de un ejemplo educativo, revisados en su contexto. No se realizó DAST ni una auditoría de autenticación, infraestructura o dependencias como parte de la comparación SAST. La política CSP es defensa adicional y no la razón por la que desaparecen los hallazgos: se corrigen las funciones.
