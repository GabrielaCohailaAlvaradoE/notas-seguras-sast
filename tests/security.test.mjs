import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMinutes, decodeTasks} from '../app/core.js';
import {renderTitle, renderDescription} from '../app/rendering.js';

test('acepta límites válidos de minutos', () => {
  assert.equal(parseMinutes('1'), 1); assert.equal(parseMinutes('1440'), 1440); assert.equal(parseMinutes(' 25 '), 25);
});
test('rechaza código, expresiones, decimales y valores fuera de rango', () => {
  for (const value of ['0', '-1', '1441', '', '2.5', '1e3', '20+5', 'globalThis.comprometido=true']) {
    assert.throws(() => parseMinutes(value));
  }
  assert.equal(globalThis.comprometido, undefined);
});
test('ambos renderizadores usan texto incluso para entradas HTML', () => {
  const payload = '<img src=x onerror="globalThis.comprometido=true">';
  for (const render of [renderTitle, renderDescription]) {
    const element = {textContent: '', set innerHTML(_) { throw new Error('Interpretación HTML insegura'); }};
    render(element, payload); assert.equal(element.textContent, payload);
  }
});
test('datos locales dañados no rompen la aplicación', () => {
  for (const raw of ['{', 'null', '{}', '[null,1,"x"]']) assert.deepEqual(decodeTasks(raw), []);
});
test('filtra registros inválidos y limita el almacenamiento a 200 tareas', () => {
  const task = {id:'1',title:'Informe',description:'Texto',minutes:25,priority:'normal',done:false};
  const invalid = {...task, priority:'javascript:alert(1)'};
  assert.deepEqual(decodeTasks(JSON.stringify([task,invalid])),[task]);
  assert.equal(decodeTasks(JSON.stringify(Array(201).fill(task))).length,200);
});
