# Guion del video conjunto de Notas Seguras

**Duración objetivo: 4 minutos 40 segundos. Límite de la consigna: 5 minutos.**

Participantes: Gabriela Estefania Cohaila Alvarado y Jhony Vargas Luque. La entrega consiste en dos artículos, uno por integrante, y un video conjunto. El video se enlaza en ambos artículos y se entrega junto con ellos.

La columna de pantalla indica qué mostrar, no debe leerse en voz alta. Las intervenciones están escritas para narración pausada. Ensayar una vez con cronómetro y conservar el margen final. Si se muestra una ejecución ya terminada, decirlo tal como está escrito, sin simular que está ocurriendo en vivo.

## Preparación antes de grabar

1. Usar grabación de pantalla con audio y resolución 1920 × 1080, si está disponible. Ambos pueden alternar voz en una llamada o grabar segmentos y unirlos.
2. Abrir cinco pestañas: la app pública, el repositorio, `examples/vulnerable/rendering.js`, `evidence/summary.json` y la ejecución de Actions enlazada abajo. Abrir también `app/core.js` y el workflow cuando corresponda.
3. Aumentar el zoom del código a 125 % si no se lee bien. Cerrar notificaciones y pestañas ajenas a la exposición.
4. En una terminal dentro del repositorio, ejecutar previamente `npm ci`. Dejar escritos, sin ejecutar aún, `npm test` y `npm run scan:eslint` para mostrarlos en el segmento indicado.
5. Preparar una tarea llamada `Preparar la exposición`, de 25 minutos. La prueba HTML se hace con `<b>Prueba de texto</b>`.

## Diálogo y secuencia de pantalla

| Tiempo | Persona | Pantalla y acción | Diálogo exacto |
|---|---|---|---|
| 0:00–0:25 | Gabriela | Mostrar la app y una portada sencilla con ambos nombres. | «Hola. Somos Gabriela Estefania Cohaila Alvarado y Jhony Vargas Luque. Presentamos Notas Seguras, una aplicación de tareas con análisis de vulnerabilidades y despliegue automatizado. Usamos Bearer CLI y ESLint con reglas de seguridad, herramientas diferentes de las que aparecen en las cuatro guías de laboratorio revisadas.» |
| 0:25–0:55 | Gabriela | Crear `Preparar la exposición`, añadir una descripción y 25 minutos. Completarla y mostrar el filtro. | «La aplicación permite crear, buscar, completar y eliminar tareas. Está hecha con HTML, CSS y JavaScript, y guarda la información en este navegador. No necesita un backend. Su código es público en GitHub y la versión corregida está disponible por HTTPS en GitHub Pages, nuestro proveedor SaaS.» |
| 0:55–1:25 | Gabriela | Abrir el repositorio y `examples/vulnerable/rendering.js`; señalar las líneas 4 y 7. Luego mostrar `core.js` vulnerable. | «Para comparar resultados, conservamos implementaciones educativas inseguras de tres funciones. Aquí, el título y la descripción se insertan con innerHTML. Esto puede interpretar una entrada como HTML y generar riesgo de XSS. La función de minutos también usaba eval. Estos ejemplos se analizan como código fuente y quedan fuera del despliegue público.» |
| 1:25–1:55 | Gabriela | Mostrar `evidence/bearer-before.json` y `evidence/summary.json`. Acercar los contadores. | «Estos son los resultados reales. Bearer detectó dos hallazgos altos de XSS. ESLint encontró tres errores: las dos inserciones HTML y el uso de eval. Son tres puntos inseguros, no cinco vulnerabilidades distintas. Bearer no señaló el eval de este ejemplo, lo que muestra por qué conviene complementar herramientas y revisar los resultados.» |
| 1:55–2:30 | Jhony | Comparar `app/rendering.js` con la baseline y abrir `app/core.js`. | «Corregimos las inserciones con textContent, porque las tareas solo necesitan texto. Para los minutos eliminamos eval, validamos números enteros entre uno y mil cuatrocientos cuarenta y convertimos con Number. No ocultamos las alertas: cambiamos las operaciones que las originaban. La política de seguridad del navegador funciona como defensa adicional.» |
| 2:30–3:00 | Jhony | Ejecutar `npm test` y `npm run scan:eslint`. Mostrar luego el resumen de Bearer ya generado. | «Ejecutamos cinco pruebas de regresión: incluyen entradas de código, texto con etiquetas y datos locales dañados. Todas pasan. ESLint reporta tres errores en los ejemplos y cero en la aplicación. En el informe de Bearer, generado por el análisis, también pasamos de dos hallazgos a cero en la versión corregida.» |
| 3:00–3:40 | Jhony | Abrir `.github/workflows/security-and-deploy.yml`; señalar eventos, `security`, `needs: security` y `deploy`. | «La automatización está definida en este workflow. Cada push a main ejecuta las pruebas y los dos analizadores, guarda los informes y construye la app. El trabajo deploy depende de security. Si falla un control, esa nueva versión no se publica. En la baseline esperamos hallazgos, pero en el código publicable no forzamos el éxito ni ignoramos errores.» |
| 3:40–4:15 | Jhony | Abrir la ejecución comprobada de Actions, mostrar ambos trabajos verdes y volver al sitio público. Escribir `<b>Prueba de texto</b>` como título. | «Esta es una ejecución ya completada: los trabajos de seguridad y despliegue finalizaron correctamente. GitHub Pages recibe solamente los seis archivos de la aplicación corregida. En el sitio público, esta entrada con etiquetas aparece literalmente, como texto. Así relacionamos la corrección del código con un comportamiento visible de la aplicación.» |
| 4:15–4:40 | Gabriela | Mostrar repositorio, app y una pantalla final con los nombres de ambos autores. | «El resultado fue dos a cero en Bearer, tres a cero en ESLint y cinco pruebas aprobadas. Cero hallazgos no significa seguridad absoluta: describe estas reglas y este alcance. Gabriela publicará el artículo sobre hallazgos y correcciones, y Jhony el artículo sobre automatización y despliegue. Ambos incluirán el repositorio, la app y este video. Compartiremos los enlaces en Telegram y entregaremos el ZIP solicitado. Gracias.» |

## Pestañas exactas

- App: https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/
- Repositorio: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast
- Baseline: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/blob/main/examples/vulnerable/rendering.js
- Corrección: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/blob/main/app/rendering.js
- Minutos: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/blob/main/app/core.js
- Resumen: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/blob/main/evidence/summary.json
- Workflow: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/blob/main/.github/workflows/security-and-deploy.yml
- Ejecución comprobada: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast/actions/runs/37145288144

## Texto para publicar el video

Título: **Escaneo de vulnerabilidades y despliegue automatizado con Bearer y ESLint**

Descripción:

«Trabajo grupal de Gabriela Estefania Cohaila Alvarado y Jhony Vargas Luque. Demostramos la aplicación Notas Seguras, la comparación entre componentes vulnerables y código corregido, los informes de Bearer CLI y ESLint, y la publicación automatizada en GitHub Pages.

Repositorio: https://github.com/GabrielaCohailaAlvaradoE/notas-seguras-sast

Aplicación: https://gabrielacohailaalvaradoe.github.io/notas-seguras-sast/

Artículo de Gabriela: ARTICULO_GABRIELA_URL_PENDIENTE

Artículo de Jhony: ARTICULO_JHONY_URL_PENDIENTE

Analizamos únicamente código propio. Los componentes vulnerables son educativos y no forman parte del sitio desplegado.»

Publicar en YouTube con visibilidad **Público**. Verificar duración inferior a 5:00 y reproducción sin iniciar sesión. Actualizar la descripción con los enlaces de ambos artículos cuando estén publicados.
