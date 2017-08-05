const abstractLedger = require('../')
const inmem = require('lucass/inmemory')
const test = require('tap').test

const createLedger = () => abstractLedger(inmem())

test('errors: root does not match', async t => {
  t.plan(2)
  let ledger = createLedger()
  try {
    await ledger.append({}, 'asdf')
  } catch (e) {
    t.same(e.message, 'Root mismatch.')
    t.type(e, 'Error')
  }
})

test('errors: set Root without matching root', async t => {
  t.plan(2)
  let ledger = createLedger()
  try {
    await ledger.setRoot('new', 'asdf')
  } catch (e) {
    t.same(e.message, 'old hash must match current hash.')
    t.type(e, 'Error')
  }
})

test('errors: validation error', async t => {
  t.plan(2)
  let ledger = createLedger()
  ledger.addValidation(async msg => {
    if (!msg) throw new Error('validation error.')
  })
  try {
    await ledger.append(null, null)
  } catch (e) {
    t.same(e.message, 'validation error.')
    t.type(e, 'Error')
  }
})

test('errors: method not implemented', async t => {
  t.plan(3)
  class Test extends abstractLedger.AbstractLedger {

  }
  let x
  try {
    x = new Test()
  } catch (e) {
    t.type(e, 'Error')
    t.ok(e.message.startsWith('Class must implement'))
  }
  t.ok(!x)
})
