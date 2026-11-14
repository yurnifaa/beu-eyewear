import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSortMenu, parseSort } from './sort';

describe('parseSort', () => {
  it('accepts every field and direction pairing', () => {
    for (const field of ['name', 'date', 'price']) {
      for (const direction of ['asc', 'desc']) {
        assert.equal(parseSort(`${field}-${direction}`), `${field}-${direction}`);
      }
    }
  });

  it('ignores anything else', () => {
    for (const value of [undefined, '', 'price', 'price-', '-asc', 'price-up', 'rating-asc', 'price-asc-extra', 'PRICE-ASC', 'price-asc; drop']) {
      assert.equal(parseSort(value), undefined, String(value));
    }
  });
});

describe('buildSortMenu', () => {
  const hrefFor = (sort: string | undefined) => (sort ? `/listing?sort=${sort}` : '/listing');

  it('offers Ascending and Descending under Name, Date and Price', () => {
    const menu = buildSortMenu(undefined, hrefFor);
    assert.deepEqual(
      menu.groups.map((group) => [group.label, group.options.map((option) => option.label)]),
      [
        ['Name', ['Ascending', 'Descending']],
        ['Date', ['Ascending', 'Descending']],
        ['Price', ['Ascending', 'Descending']],
      ],
    );
    assert.equal(menu.groups[2].options[1].href, '/listing?sort=price-desc');
  });

  it('shows no sort as Featured and a plain Sort button', () => {
    const menu = buildSortMenu(undefined, hrefFor);
    assert.equal(menu.reset.active, true);
    assert.equal(menu.reset.href, '/listing');
    assert.equal(menu.buttonLabel, 'Sort');
    assert.ok(menu.groups.every((group) => group.options.every((option) => !option.active)));
  });

  it('marks exactly the chosen option and labels the button with it', () => {
    const menu = buildSortMenu('date-desc', hrefFor);
    assert.equal(menu.reset.active, false);
    const active = menu.groups.flatMap((group) => group.options.filter((option) => option.active).map((option) => `${group.label} ${option.label}`));
    assert.deepEqual(active, ['Date Descending']);
    assert.equal(menu.buttonLabel, 'Date: Descending');
    assert.equal(menu.shortButtonLabel, 'Date: Desc');
  });
});
