# Detectar y corregir XSS en JavaScript con Bearer CLI y ESLint

Por Gabriela Estefania Cohaila Alvarado. Proyecto realizado junto con Jhony Vargas Luque.

¿Qué ocurre cuando una aplicación interpreta una nota como código HTML? En este proyecto construimos **Notas Seguras**, un tablero de tareas, y comparamos implementaciones inseguras de sus funciones con la aplicación corregida. Bearer CLI identificó dos hallazgos altos; ESLint señaló esos mismos puntos y un uso adicional de `eval`. Después de aplicar las correcciones, ambos análisis terminaron sin hallazgos en el código publicable.

## Aplicación, código y demostración

- [Repositorio público](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast).
- [Aplicación desplegada en GitHub Pages](https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/).
- [Ejecución comprobada del análisis y despliegue](https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37145288144).
- Video del equipo de menos de cinco minutos: **VIDEO_URL_PENDIENTE**.

La app permite crear, buscar, completar y eliminar tareas. Utiliza HTML, CSS y JavaScript, y conserva los datos en el navegador mediante `localStorage`. No tiene backend ni cuentas de usuario. Esto permite estudiar riesgos del cliente sin incorporar servicios de pago.

## Por qué elegimos estas herramientas

Las cuatro guías de laboratorio revisadas utilizan SonarQube/SonarCloud, Snyk, Semgrep y tfsec. Para realizar una comparación diferente elegimos **Bearer CLI 2.1.1**, incluido en el catálogo de analizadores de código de OWASP, y **ESLint 10.12.0** con el plugin de Mozilla **eslint-plugin-no-unsanitized 4.1.5**. ESLint es un analizador configurable; en este trabajo ejecutamos reglas concretas de seguridad, no una auditoría general de todos los riesgos de JavaScript.

Bearer analiza el código fuente para señalar patrones de riesgo. El plugin de Mozilla permite prohibir inserciones HTML inseguras, mientras la regla `no-eval` de ESLint detecta evaluación dinámica de código. No es necesario registrar una cuenta de escaneo para ejecutar esta configuración.

La referencia de [OWASP](https://community.owasp.org/Source_Code_Analysis_Tools) orienta la selección de herramientas, y el [catálogo de NIST](https://www.nist.gov/itl/csd/secure-systems-and-applications/source-code-security-analyzers) sirve como referencia adicional. Estar listado no certifica la seguridad de nuestra aplicación.

## Un experimento con alcance explícito

La carpeta `examples/vulnerable/` conserva implementaciones educativas inseguras de tres funciones. No representa una aplicación anterior publicada. La carpeta `app/` contiene la aplicación completa con esas funciones corregidas. La comparación inicial abarca los componentes vulnerables; la comprobación final abarca toda la aplicación publicable.

La primera función vulnerable escribe el título así:

```javascript
export function renderTitle(element, userInput) {
  element.innerHTML = userInput;
}
```

La función de descripción utiliza el mismo patrón. Si se recibe contenido controlado por un atacante, el navegador puede interpretarlo como marcado, con riesgo de XSS. En una app local, la exposición depende de cómo llegue esa entrada al navegador; no afirmamos que exista un servidor multiusuario comprometido. El problema concreto es permitir que datos se interpreten como HTML.

La corrección conserva el contenido como texto:

```javascript
export function renderTitle(element, userInput) {
  element.textContent = userInput;
}
```

No necesitamos admitir HTML enriquecido, por lo que `textContent` satisface la función del producto. Una entrada como `<b>Prueba de texto</b>` se muestra literalmente.

## Cómo reproducir el análisis

Con Node.js 24, clonar el repositorio y ejecutar:

```bash
git clone https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast.git
cd notas-seguras-sast
npm ci
npm test
npm run scan:eslint
```

Para Bearer, utilizar Linux x86_64 o Ubuntu en WSL desde la raíz del proyecto:

```bash
bash scripts/install-bearer.sh
bash scripts/scan-bearer.sh
node scripts/summarize.mjs
```

El instalador obtiene la versión oficial y verifica la suma SHA256 publicada para ese archivo. Los escaneos generan JSON, y el análisis final de Bearer también genera SARIF. La carpeta `evidence/` conserva los resultados de referencia y `reports/` contiene los de cada ejecución local.

## Qué encontramos realmente

| Punto del código vulnerable | Bearer CLI | ESLint | Corrección |
|---|---|---|---|
| `rendering.js`, línea 4 | XSS, alto, CWE-79 | `no-unsanitized/property` | `textContent` |
| `rendering.js`, línea 7 | XSS, alto, CWE-79 | `no-unsanitized/property` | `textContent` |
| `core.js`, línea 4 | No reportado en este caso | `no-eval` | Validar enteros y usar `Number` |

Son **tres puntos inseguros**, no cinco vulnerabilidades diferentes. Dos alertas se repiten entre herramientas. También debemos distinguir una severidad alta de Bearer de un error de regla de ESLint: no son la misma escala.

La función insegura para interpretar minutos utilizaba `eval(userInput)`. La versión corregida acepta únicamente números enteros entre 1 y 1440. Una entrada como `20+5` se rechaza, porque el campo representa minutos y no una calculadora de expresiones.

## De la corrección al despliegue

GitHub Actions ejecuta cinco pruebas de regresión, los dos analizadores, un resumen de resultados y la construcción. El trabajo de despliegue tiene `needs: security`; si falla el control de seguridad, no se publica esa nueva versión. Las solicitudes de cambio se analizan sin desplegar.

GitHub Pages aloja la aplicación mediante HTTPS. La construcción copia exclusivamente seis archivos de `app/`, dejando fuera los ejemplos vulnerables y las herramientas. Esta publicación utiliza un repositorio público y runners estándar de Actions.

## Lo que aprendimos

La comparación mostró una razón práctica para combinar herramientas: Bearer encontró los dos usos de HTML inseguro, pero no el `eval` de este ejemplo; ESLint cubrió ese punto con una regla específica. Revisar el flujo de datos y comprobar el comportamiento sigue siendo necesario.

El resultado final fue **Bearer 2 → 0, ESLint 3 → 0 y cinco pruebas aprobadas**. Cero hallazgos significa que las reglas ejecutadas no reportaron problemas en ese alcance. No demuestra que la app sea invulnerable ni sustituye pruebas dinámicas, revisión de lógica o evaluación del almacenamiento local.

## Referencias técnicas

- [Documentación de Bearer CLI](https://docs.bearer.com/).
- [Regla de inserción HTML de Bearer](https://docs.bearer.com/reference/rules/javascript_lang_dangerous_insert_html/).
- [Plugin de seguridad de Mozilla](https://github.com/mozilla/eslint-plugin-no-unsanitized).
- [Regla no-eval de ESLint](https://eslint.org/docs/latest/rules/no-eval).
- [Workflow de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
