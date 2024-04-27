
import { runFile, insp } from '../../helpers/testsHelper';

let pjs = runFile(import.meta.url, 'parenthesis.code');

test('result = -1', () => {
  expect(pjs.engine.results[0]).toBe(-1);
});

test('result = 1', () => {
  expect(pjs.engine.results[1]).toBe(1);
});

test('result = -1', () => {
  expect(pjs.engine.results[2]).toBe(-1);
});

test('result = 6', () => {
  expect(pjs.engine.results[3]).toBe(6);
});