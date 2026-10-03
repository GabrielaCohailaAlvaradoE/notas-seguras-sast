# Un despliegue que depende del análisis de seguridad con GitHub Actions

Por Jhony Vargas Luque. Proyecto realizado junto con Gabriela Estefania Cohaila Alvarado.

Un informe de vulnerabilidades tiene más utilidad cuando influye en lo que se publica. En **Notas Seguras** conectamos dos analizadores de código con GitHub Actions: las pruebas y los escaneos deben finalizar correctamente antes de que una nueva versión llegue a GitHub Pages. Este artículo explica el flujo y las evidencias que permiten comprobarlo.

## Enlaces del proyecto

- [Código público de la aplicación](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast).
- [Aplicación en el proveedor SaaS GitHub Pages](https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/).
- [Ejecución satisfactoria de la automatización](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37145288144).
- Video conjunto de menos de cinco minutos: **VIDEO_URL_PENDIENTE**.

## Una aplicación pequeña con un flujo verificable

La aplicación es un tablero de tareas escrito en JavaScript. Permite registrar título, descripción, prioridad y minutos; también buscar, filtrar y completar tareas. Almacena los datos con `localStorage`, por lo que no hay sincronización entre navegadores ni un servidor de datos. El sitio publicado es estático y funcional.

El repositorio distingue `app/`, que contiene el producto corregido, de `examples/vulnerable/`, que conserva las implementaciones inseguras usadas como comparación. Los ejemplos no se entregan como parte del sitio. Esto mantiene una evidencia legible sin desplegar las funciones inseguras.

## Selección de analizadores

Las guías de laboratorio compartidas cubren SonarQube/SonarCloud, Snyk, Semgrep y tfsec. Para este trabajo utilizamos **Bearer CLI 2.1.1** y **ESLint 10.12.0 con eslint-plugin-no-unsanitized 4.1.5**. Bearer figura en el [catálogo OWASP](https://community.owasp.org/Source_Code_Analysis_Tools); también consultamos el [directorio de NIST](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers) como referencia de analizadores.

ESLint complementa el análisis con reglas que prohíben asignaciones HTML inseguras y evaluación dinámica de JavaScript. Lo utilizamos como control de patrones de seguridad específico, sin equipararlo a una auditoría completa de la aplicación.

## Los hallazgos que motivan el control

En la baseline, el título y la descripción se insertaban mediante `element.innerHTML = userInput`. Bearer reportó dos hallazgos altos de XSS, asociados a CWE-79. ESLint reportó las dos asignaciones y además un `eval` en la interpretación de minutos.

| Medición | Baseline de componentes | Aplicación corregida |
|---|---:|---:|
| Hallazgos de Bearer | 2 altos | 0 |
| Errores de reglas de ESLint | 3 | 0 |
| Pruebas de regresión aprobadas | No aplica | 5 |

No sumamos las alertas como cinco fallos diferentes: las dos herramientas coinciden en dos puntos. Tampoco atribuimos a Bearer el hallazgo de `eval`; ese resultado vino de ESLint.

Las correcciones fueron concretas: `textContent` para mostrar texto, y validación de minutos enteros entre 1 y 1440 antes de convertir con `Number`. Una política CSP adicional restringe recursos del sitio, pero el cambio decisivo consiste en eliminar las operaciones inseguras del código.

## Así funciona la automatización

El archivo `.github/workflows/security-and-deploy.yml` se activa con pushes a `main`, solicitudes de cambio y ejecuciones manuales. Su secuencia es:

1. Descargar el código e instalar Node.js 24.
2. Reproducir las dependencias de desarrollo con `npm ci`.
3. Ejecutar las pruebas de regresión.
4. Comparar la baseline y la aplicación con ESLint.
5. Instalar Bearer desde su versión oficial, verificar SHA256 y analizar ambos alcances.
6. Crear el resumen y guardar los informes.
7. Construir los archivos de la aplicación.
8. Desplegar en Pages solo desde `main` si el trabajo anterior pasó.

La dependencia fundamental es:

```yaml
deploy:
  needs: security
  permissions:
    pages: write
    id-token: write
```

El trabajo `security` tiene permiso de lectura del repositorio. El despliegue obtiene los permisos de Pages y del token de identidad solo en su propio trabajo. No se necesita colocar una clave personal de nube en el código.

## Un detalle que evita esconder errores

La baseline contiene problemas intencionales, así que el script de Bearer espera código de salida 1 en ese análisis. En cambio, el escaneo de `app/` debe finalizar con éxito normal. No se aplica `continue-on-error` al control de la versión publicable ni se fuerza `--exit-code 0`.

El comparador de ESLint también comprueba que existan tres errores en los componentes educativos y cero en la app. Esto confirma que el ejemplo sigue siendo útil y que la versión candidata pasa las reglas configuradas. La diferencia entre un fallo esperado del experimento y un fallo del producto queda explícita.

## Evidencias y reproducción

Los informes de cada ejecución están en el artefacto `security-reports`, con retención de siete días. Para evitar depender únicamente de esa retención, el repositorio guarda una instantánea en `evidence/` y documenta la ejecución de referencia.

La comparación se puede repetir con:

```bash
npm ci
npm test
npm run scan:eslint
bash scripts/install-bearer.sh
bash scripts/scan-bearer.sh
node scripts/summarize.mjs
npm run build
```

Bearer requiere Linux x86_64 o Ubuntu en WSL para estos scripts. `npm start` abre la app en `http://127.0.0.1:4173`. Las versiones de las dependencias están fijadas en `package-lock.json`, y las acciones de GitHub usan SHA de commit en el workflow.

## Publicación y límites del resultado

GitHub Pages sirve los archivos estáticos mediante HTTPS y cumple el papel de proveedor SaaS público. Se configura GitHub Actions como origen de publicación. La [documentación de GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) describe este flujo; el proyecto usa las opciones gratuitas para repositorios públicos y runners estándar.

La ejecución enlazada terminó con los trabajos `security` y `deploy` en estado satisfactorio, y la aplicación respondió públicamente. Si un cambio futuro falla, se bloquea la nueva publicación; el sitio previamente desplegado puede seguir disponible.

El resultado demuestra una automatización reproducible con reglas concretas. Quedan fuera una auditoría de infraestructura, pruebas dinámicas y una evaluación completa de dependencias. Las notas locales no están cifradas por la aplicación. El análisis estático reduce riesgos detectables, pero sus límites deben acompañar los resultados.

## Referencias

- [Comandos de Bearer CLI](https://docs.bearer.com/reference/commands/).
- [Plugin no-unsanitized de Mozilla](https://github.com/mozilla/eslint-plugin-no-unsanitized).
- [ESLint no-eval](https://eslint.org/docs/latest/rules/no-eval).
- [GitHub Actions y su uso gratuito](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
