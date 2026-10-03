import {mkdir, copyFile} from 'node:fs/promises';
// Lista explícita: ni ejemplos vulnerables ni herramientas se publican.
const files = ['index.html', 'styles.css', 'tokens.css', 'main.js', 'core.js', 'rendering.js'];
await mkdir('dist', {recursive: true});
for (const file of files) await copyFile('app/' + file, 'dist/' + file);
console.log('Construcción completa: ' + files.length + ' archivos de app/.');
