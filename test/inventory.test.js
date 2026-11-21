'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

function makeProduct(stock, reserved) {
  return { id: 1, sku: 'TEST-001', name: 'Test product', price: 10, stock, reserved };
}

test('CURRENT BEHAVIOUR: check allows qty 1 when sellable stock is 1', function () {
  const product = makeProduct(1, 0);

  assert.deepEqual(inventory.check([product], [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: check rejects qty 2 when sellable stock is 1', function () {
  const product = makeProduct(1, 0);

  assert.deepEqual(inventory.check([product], [{ id: 1, qty: 2 }]), {
    ok: false,
    msg: 'Test product is out of stock (1 sellable available)'
  });
});

test('CURRENT BEHAVIOUR: check accepts qty 0 when sellable stock is 1', function () {
  const product = makeProduct(1, 0);

  assert.deepEqual(inventory.check([product], [{ id: 1, qty: 0 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: check allows the remaining unit when stock 4 has 3 reserved', function () {
  const product = makeProduct(4, 3);

  assert.deepEqual(inventory.check([product], [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: cancel after reserve restores stock and leaves reserved unchanged', function () {
  const product = makeProduct(5, 2);
  // Match routes/orders.js line item shape: id, sku, name, hsn, price, qty.
  const items = [{
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: '0000',
    price: product.price,
    qty: 2
  }];
  const db = {
    products: [product],
    orders: [{ id: 1007, status: 'pending', paymentMode: 'cash', items }]
  };
  const before = { stock: product.stock, reserved: product.reserved };

  inventory.reserve(db.products, items);
  const afterReserve = { stock: product.stock, reserved: product.reserved };
  const result = orders.cancel(db, 1007, 'test cancellation');
  const afterCancel = { stock: product.stock, reserved: product.reserved };

  assert.deepEqual(before, { stock: 5, reserved: 2 });
  assert.deepEqual(afterReserve, { stock: 3, reserved: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.deepEqual(afterCancel, { stock: 5, reserved: 2 });
});

test('correct behavior: allow exactly available stock and restore a cancelled order once', function () {
  const product = makeProduct(5, 2);
  const items = [{
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: '0000',
    price: product.price,
    qty: 3
  }];
  const db = {
    products: [product],
    orders: [{ id: 1007, status: 'pending', paymentMode: 'cash', items }]
  };

  assert.deepEqual(inventory.check(db.products, items), { ok: true });
  assert.equal(inventory.check(db.products, [{ id: product.id, qty: 4 }]).ok, false);
  assert.equal(inventory.check(db.products, [
    { id: product.id, qty: 2 },
    { id: product.id, qty: 2 }
  ]).ok, false);

  inventory.reserve(db.products, items);
  assert.deepEqual({ stock: product.stock, reserved: product.reserved }, { stock: 2, reserved: 2 });

  const result = orders.cancel(db, 1007, 'test cancellation');
  assert.equal(result.ok, true);
  assert.deepEqual({ stock: product.stock, reserved: product.reserved }, { stock: 5, reserved: 2 });

  const secondResult = orders.cancel(db, 1007, 'duplicate cancellation');
  assert.equal(secondResult.ok, false);
  assert.deepEqual({ stock: product.stock, reserved: product.reserved }, { stock: 5, reserved: 2 });
});
