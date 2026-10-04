# Análisis de vulnerabilidades y despliegue automatizado de una app con Bearer CLI y ESLint

**Autores: Gabriela Estefania Cohaila Alvarado y Jhony Vargas Luque.**

En este proyecto construimos **Notas Seguras**, una aplicación de tareas en JavaScript, para estudiar cómo detectar y corregir problemas de seguridad antes de publicar una nueva versión. Comparamos implementaciones educativas inseguras con el código corregido mediante **Bearer CLI** y **ESLint con reglas de seguridad**, y conectamos los controles con un despliegue automatizado en **GitHub Pages**.

Los resultados fueron concretos: Bearer reportó dos hallazgos altos en los componentes vulnerables; ESLint señaló esos mismos puntos y un uso adicional de `eval`. Después de corregir el código, ambos analizadores terminaron sin hallazgos en la aplicación publicable y las cinco pruebas de regresión pasaron. En este artículo presentamos conjuntamente los hallazgos, las correcciones y la automatización.

## Código, aplicación y video del equipo

- [Repositorio público de Notas Seguras](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast).
- [Aplicación pública en GitHub Pages](https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/).
- [Ejecución comprobada del análisis y despliegue](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37145288144).
- [Informes de la ejecución de referencia](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/tree/main/evidence).
- Video público del equipo, de máximo cinco minutos: **VIDEO_URL_PENDIENTE**.

## La aplicación y el alcance del experimento

Notas Seguras permite crear tareas con título, descripción, prioridad y minutos estimados; también buscar, filtrar, completar y eliminar tareas. Está desarrollada con HTML, CSS y JavaScript. Guarda la información mediante `localStorage` en el navegador, sin cuentas, sincronización ni backend de negocio. GitHub Pages sirve los archivos estáticos de la aplicación por HTTPS.

El repositorio separa dos alcances. `examples/vulnerable/` conserva las implementaciones inseguras de tres funciones para realizar la comparación. `app/` contiene la aplicación completa con esas funciones corregidas. La baseline es un ejemplo educativo de componentes, no una aplicación anterior que se haya publicado. El escaneo inicial cubre esos componentes; el análisis final cubre toda la aplicación publicable.

## Selección de herramientas distintas a los laboratorios

Revisamos las cuatro guías de laboratorio compartidas: lab01 utiliza SonarQube/SonarCloud; lab02, Snyk; lab03, Semgrep; y lab04, tfsec y SonarCloud. Para este trabajo elegimos **Bearer CLI 2.1.1** y **ESLint 10.12.0 con eslint-plugin-no-unsanitized 4.1.5**, que no aparecen en esas cuatro guías.

Bearer figura en el [catálogo de analizadores de código de OWASP](https://community.owasp.org/Source_Code_Analysis_Tools). También consultamos el [directorio de analizadores de NIST](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers) como referencia. La inclusión en un catálogo no certifica la seguridad del proyecto ni implica un aval de sus resultados.

ESLint es un analizador configurable. En nuestro caso, el plugin de Mozilla prohíbe operaciones de inserción HTML inseguras y las reglas de ESLint restringen evaluación dinámica de JavaScript. Lo usamos como control complementario de patrones de seguridad, sin atribuirle una auditoría general de todos los riesgos de la aplicación. Esta configuración no requiere una cuenta de escaneo.

## Preparación y ejecución de los análisis

Con Node.js 24 instalado, se puede reproducir el proyecto:

```bash
git clone https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast.git
cd notas-seguras-sast
npm ci
npm test
npm run scan:eslint
```

Para ejecutar Bearer, utilizar Linux x86_64 o Ubuntu en WSL. Desde la raíz del mismo repositorio:

```bash
bash scripts/install-bearer.sh
bash scripts/scan-bearer.sh
node scripts/summarize.mjs
```

El instalador descarga Bearer 2.1.1 de su publicación oficial y verifica el archivo con la suma SHA256 publicada para esa versión. El script analiza primero `examples/vulnerable/` y después `app/`, genera informes JSON y produce también SARIF para el código corregido. `reports/` contiene los resultados de cada ejecución; `evidence/` conserva una instantánea verificable de la ejecución enlazada.

Para abrir la aplicación localmente, ejecutar `npm start` y visitar `http://127.0.0.1:4173`.

## Hallazgo 1 y 2: inserción de texto como HTML

Las implementaciones vulnerables del título y la descripción usaban este patrón:

```javascript
export function renderTitle(element, userInput) {
  element.innerHTML = userInput;
}
```

El navegador interpreta el contenido asignado a `innerHTML` como marcado. Si esa entrada está controlada por un atacante, puede introducir contenido activo y generar riesgo de XSS. En esta aplicación local, la exposición depende de cómo llegue la entrada al navegador; no afirmamos que exista un servidor multiusuario comprometido.

Bearer reportó dos hallazgos altos de la regla `javascript_lang_dangerous_insert_html`, asociados a **CWE-79**, en las líneas 4 y 7 de `examples/vulnerable/rendering.js`. ESLint señaló las mismas asignaciones con `no-unsanitized/property`.

Las tareas no necesitan contenido HTML enriquecido, por lo que corregimos ambas funciones con `textContent`:

```javascript
export function renderTitle(element, userInput) {
  element.textContent = userInput;
}
```

Con este cambio, los datos se presentan como texto. Una entrada como `<b>Prueba de texto</b>` se muestra literalmente, sin convertirse en marcado. Esta comprobación visual relaciona la corrección con un comportamiento observable.

## Hallazgo 3: evaluación dinámica de los minutos

El componente vulnerable para interpretar minutos utilizaba:

```javascript
export function parseMinutes(userInput) {
  return eval(userInput);
}
```

`eval` puede interpretar la entrada como JavaScript, aunque el propósito del campo sea registrar una duración. La regla `no-eval` de ESLint detectó esta operación en la línea 4 de `examples/vulnerable/core.js`. **Bearer no la reportó en este ejemplo**; no le atribuimos ese hallazgo.

La corrección elimina la evaluación de expresiones y valida el dominio permitido:

```javascript
export function parseMinutes(userInput) {
  const value = String(userInput).trim();
  if (!/^\d{1,4}$/.test(value)) {
    throw new Error('Usa minutos enteros entre 1 y 1440.');
  }
  const minutes = Number(value);
  if (minutes < 1 || minutes > 1440) {
    throw new Error('Usa minutos enteros entre 1 y 1440.');
  }
  return minutes;
}
```

Una entrada como `25` es válida; `20+5`, valores fuera de rango o código JavaScript se rechazan. El producto necesita minutos enteros, no una calculadora de expresiones.

## Resultados después de corregir

| Punto del código vulnerable | Bearer CLI | ESLint | Corrección |
|---|---|---|---|
| Título, `rendering.js:4` | XSS alto, CWE-79 | `no-unsanitized/property` | `textContent` |
| Descripción, `rendering.js:7` | XSS alto, CWE-79 | `no-unsanitized/property` | `textContent` |
| Minutos, `core.js:4` | No reportado en este caso | `no-eval` | Validación y `Number` |

| Medición | Componentes vulnerables | Aplicación corregida |
|---|---:|---:|
| Hallazgos de Bearer | 2 altos | 0 |
| Errores de reglas de ESLint | 3 | 0 |
| Pruebas de regresión aprobadas | No aplica | 5 |

Son **tres puntos inseguros**, no cinco vulnerabilidades diferentes: los dos analizadores coinciden en las inserciones HTML. Tampoco se debe equiparar un error de regla de ESLint con la escala de severidad de Bearer.

Las pruebas comprueban límites válidos de minutos, rechazo de expresiones y código, uso de texto en ambos renderizadores, manejo de JSON local dañado y filtrado de registros inválidos con un límite de almacenamiento. La app incluye además una política CSP, pero la desaparición de las alertas se debe a corregir las funciones, no a ocultar los hallazgos.

## Automatización de los controles y del despliegue

El archivo `.github/workflows/security-and-deploy.yml` se activa con pushes a `main`, solicitudes de cambio y ejecuciones manuales. Su trabajo `security` realiza los siguientes pasos:

1. Descarga el código e instala Node.js 24.
2. Reproduce las dependencias con `npm ci` y ejecuta las cinco pruebas.
3. Analiza la baseline y la aplicación con ESLint.
4. Instala Bearer, verifica SHA256 y analiza ambos alcances.
5. Genera el resumen y guarda el artefacto `security-reports`.
6. Construye la app y prepara los archivos para Pages.

El despliegue se ejecuta después y únicamente para `main`, fuera de las solicitudes de cambio. La dependencia fundamental es:

```yaml
deploy:
  needs: security
  permissions:
    pages: write
    id-token: write
```

Si falla el trabajo de seguridad, no se publica esa nueva versión. El sitio previamente desplegado puede seguir disponible. El trabajo de análisis tiene permiso de lectura; los permisos de publicación se conceden en el trabajo de despliegue.

La baseline contiene problemas intencionales, así que el script de Bearer espera código de salida 1 en ese análisis. En cambio, el escaneo de `app/` debe finalizar con éxito normal. No se fuerza `--exit-code 0` ni se aplica `continue-on-error` al control de la aplicación publicable. El comparador de ESLint exige tres errores en los componentes educativos y cero en la app.

La construcción copia exclusivamente seis archivos de `app/`; no publica los ejemplos vulnerables, los scripts ni `node_modules`. Las acciones de GitHub están fijadas por SHA de commit y las dependencias de Node por versión y lockfile. Los informes de Actions se conservan siete días, y la copia versionada en `evidence/` conserva la ejecución de referencia.

## Publicación en un proveedor SaaS público

Configuramos **GitHub Actions** como origen de publicación en Settings → Pages. **GitHub Pages** aloja la aplicación estática mediante HTTPS. El proyecto utiliza un repositorio público y runners estándar `ubuntu-latest`, sin contratar servicios de pago ni configurar una clave personal de nube en el código.

La ejecución enlazada terminó con `security` y `deploy` en estado satisfactorio. El sitio respondió HTTP 200 y verificamos en el navegador la creación de tareas y la presentación literal de etiquetas. Así, la evidencia conecta el código, el análisis, la automatización y la aplicación disponible públicamente.

## Conclusiones del equipo

La comparación mostró una diferencia útil de cobertura: Bearer detectó las dos inserciones HTML inseguras y ESLint añadió el uso de `eval`. Corregir las operaciones y comprobar el comportamiento permitió pasar de **2 a 0 hallazgos en Bearer**, de **3 a 0 errores en ESLint** y obtener **cinco pruebas aprobadas**.

Integrar estos controles antes del despliegue permite que sus resultados influyan en lo que se publica. Sin embargo, cero hallazgos describe las reglas, versiones y alcance utilizados; no demuestra seguridad absoluta. Quedan fuera una auditoría completa, pruebas dinámicas y una evaluación SCA como parte de esta comparación. La aplicación guarda notas locales sin cifrado propio y no debe utilizarse para información sensible.

## Referencias técnicas

- [OWASP — Source Code Analysis Tools](https://community.owasp.org/Source_Code_Analysis_Tools).
- [NIST — Source Code Security Analyzers](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers).
- [Documentación y comandos de Bearer CLI](https://docs.bearer.com/reference/commands/).
- [Regla de inserción HTML de Bearer](https://docs.bearer.com/reference/rules/javascript_lang_dangerous_insert_html/).
- [Plugin no-unsanitized de Mozilla](https://github.com/mozilla/eslint-plugin-no-unsanitized).
- [Regla no-eval de ESLint](https://eslint.org/docs/latest/rules/no-eval).
- [Workflows personalizados para GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Uso y costos de GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
