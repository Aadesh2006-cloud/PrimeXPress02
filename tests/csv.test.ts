import { it } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell } from '../src/utils/csv';

it('CSV escapes delimiters, quotes and multiline text inside one cell', () => {
  assert.equal(csvCell('Name, "quoted"\nnext'), '"Name, ""quoted""\nnext"');
});
it('CSV neutralizes formulas including whitespace-prefixed formulas', () => {
  for (const value of ['=1+1', '+cmd', '-cmd', '@SUM(A1)', ' \t=1+1', '\tvalue', '\nvalue']) {
    assert.equal(csvCell(value), `"'${value}"`);
  }
});
it('CSV keeps ordinary values and handles missing data', () => {
  assert.equal(csvCell('Normal Name'), '"Normal Name"');
  assert.equal(csvCell(undefined), '""');
});
