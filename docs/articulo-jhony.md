# Un despliegue que depende del análisis de seguridad con GitHub Actions

**Autor: Jhony Vargas Luque.** Proyecto desarrollado junto con Gabriela Estefania Cohaila Alvarado.

Un análisis de vulnerabilidades tiene más valor cuando puede impedir que una versión insegura llegue a producción. En este proyecto construimos **Notas Seguras**, una aplicación web de tareas, y conectamos las pruebas y los escaneos con un despliegue automatizado en GitHub Pages. El sitio público se actualiza solamente cuando la versión corregida supera los controles definidos en el repositorio.

Este artículo se enfoca en la automatización y el despliegue. El artículo de Gabriela explica los hallazgos de XSS y `eval`, las correcciones aplicadas y la comparación de herramientas.

## Enlaces del proyecto

- [Repositorio público](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast).
- [Aplicación pública en GitHub Pages](https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/).
- [Ejecución comprobada de GitHub Actions](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37193052623).
- [Evidencias del análisis](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/tree/main/evidence).
- Video público del equipo, de máximo cinco minutos: **VIDEO_URL_PENDIENTE**.

## Aplicación y alcance

Notas Seguras permite crear, buscar, filtrar, completar y eliminar tareas. Cada tarea tiene título, descripción, prioridad y minutos estimados. Está desarrollada con HTML, CSS y JavaScript; los datos se guardan mediante `localStorage` en el navegador. No tiene cuentas, sincronización ni un backend de negocio.

El repositorio diferencia dos alcances. `examples/vulnerable/` contiene implementaciones educativas inseguras que permiten reproducir los hallazgos. `app/` contiene la aplicación corregida. La baseline no fue desplegada: el proceso de construcción copia de manera explícita solamente seis archivos de `app/` al resultado que llega a GitHub Pages.

## Herramientas diferentes a los laboratorios

Las guías revisadas de laboratorio utilizan SonarQube/SonarCloud, Snyk, Semgrep y tfsec. Para este trabajo elegimos **Bearer CLI 2.1.1** y **ESLint 10.12.0 con eslint-plugin-no-unsanitized 4.1.5**. Bearer aparece en el [catálogo de herramientas de análisis de código de OWASP](https://community.owasp.org/Source_Code_Analysis_Tools); también consultamos el [directorio de NIST](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers).

Bearer encontró dos inserciones HTML inseguras en los componentes de referencia. ESLint encontró esos mismos dos puntos y un uso de `eval`. En la aplicación corregida, ambos terminaron sin hallazgos y las cinco pruebas de regresión pasaron. Estar incluido en un catálogo no certifica la seguridad del proyecto: los resultados corresponden al código y las reglas ejecutadas.

## Pipeline de seguridad y publicación

El workflow `.github/workflows/security-and-deploy.yml` se ejecuta con un push a `main`, una solicitud de cambio o una ejecución manual. Una solicitud de cambio ejecuta los controles sin publicar. Cuando se integra un cambio en `main`, el trabajo `security` realiza lo siguiente:

1. Descarga el código y configura Node.js 24.
2. Instala dependencias reproducibles mediante `npm ci`.
3. Ejecuta cinco pruebas de regresión.
4. Compara la baseline y la aplicación con ESLint.
5. Descarga Bearer 2.1.1, comprueba su SHA256 y analiza ambos alcances.
6. Genera un resumen, conserva los informes y construye la app.

Después se ejecuta el trabajo de despliegue:

```yaml
deploy:
  needs: security
  permissions:
    pages: write
    id-token: write
```

`needs: security` es la condición central. El despliegue espera el resultado del análisis. Si falla una prueba, el análisis de la aplicación o la construcción, no se publica una nueva versión. La versión anterior del sitio puede seguir visible, pero el cambio que falló no llega a GitHub Pages.

El trabajo de seguridad tiene permiso de lectura del repositorio. Los permisos para publicar Pages se entregan únicamente en el trabajo `deploy`. De esta forma no se guarda una clave personal de nube en el código.

## Evitar que los errores se oculten

La baseline contiene problemas intencionales. Por eso su escaneo de Bearer espera código de salida 1. En cambio, el análisis de `app/` debe finalizar con éxito normal: no se fuerza `--exit-code 0` ni se aplica `continue-on-error` al código publicable.

El comparador de ESLint también exige tres errores en los ejemplos y cero en la aplicación. Esto comprueba que la baseline sigue siendo útil para la demostración y que la versión candidata no pasa porque se hayan desactivado los controles.

| Medición | Componentes vulnerables | Aplicación corregida |
|---|---:|---:|
| Bearer CLI | 2 hallazgos altos | 0 |
| ESLint con reglas de seguridad | 3 errores | 0 |
| Pruebas automatizadas | No aplica | 5 aprobadas |

Los dos hallazgos de Bearer y los dos hallazgos de inserción HTML de ESLint describen los mismos dos puntos de código; no deben sumarse como cuatro vulnerabilidades distintas. El uso de `eval` fue reportado por ESLint en este ejemplo y no por Bearer.

## Evidencia y reproducción

Los informes se guardan como artefacto `security-reports` de GitHub Actions y existe una copia de referencia en `evidence/`. Para reproducir los controles:

```bash
npm ci
npm test
npm run scan:eslint
bash scripts/install-bearer.sh
bash scripts/scan-bearer.sh
node scripts/summarize.mjs
npm run build
```

Los scripts de Bearer requieren Linux x86_64 o Ubuntu en WSL. El instalador descarga la versión oficial y verifica el SHA256 de su publicación. Para ejecutar la app localmente se usa `npm start`, que sirve la app en `http://127.0.0.1:4173`.

Las acciones de GitHub están fijadas por SHA de commit y las dependencias de Node por `package-lock.json`. El sitio público respondió HTTP 200; además comprobamos la creación de tareas y que una entrada con etiquetas se muestra como texto, sin interpretarse como HTML.

## Proveedor SaaS y límites

GitHub Pages cumple el requisito de proveedor SaaS público porque aloja la aplicación estática por HTTPS. GitHub Actions automatiza el análisis, la construcción y la publicación. El repositorio es público y utiliza runners estándar, sin contratar un servicio de pago.

Este flujo demuestra que los controles configurados influyen en lo que se publica. Sin embargo, cero hallazgos no implica seguridad absoluta. No se realizaron pruebas dinámicas, una auditoría completa de infraestructura ni un análisis exhaustivo de dependencias. Las tareas se guardan localmente y la aplicación no cifra notas; por eso no debe usarse para datos sensibles.

## Conclusión

La automatización convierte el análisis en una condición de despliegue. La versión corregida se publica únicamente después de superar pruebas, ESLint y Bearer. La combinación de herramientas aportó cobertura complementaria: Bearer identificó los usos de HTML inseguro y ESLint añadió el caso de `eval`.

La trazabilidad queda disponible en el repositorio, los informes, la ejecución de Actions y la aplicación pública. Esto permite verificar el proceso completo: código, hallazgos, correcciones, automatización y despliegue.

## Referencias

- [Comandos de Bearer CLI](https://docs.bearer.com/reference/commands/).
- [Regla de inserción HTML de Bearer](https://docs.bearer.com/reference/rules/javascript_lang_dangerous_insert_html/).
- [Plugin no-unsanitized de Mozilla](https://github.com/mozilla/eslint-plugin-no-unsanitized).
- [Regla no-eval de ESLint](https://eslint.org/docs/latest/rules/no-eval).
- [Workflows personalizados para GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
