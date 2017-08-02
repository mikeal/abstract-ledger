const test = require('tap').test

module.exports = (name, createLedger) => {
  test(`${name}: basic append`, async t => {
    t.plan(3)
    let ledger = createLedger()
    let root = await ledger.append({text: 'test'}, null)
    t.same(root, ledger._root)
    let buff = await ledger._get(root)
    let block = JSON.parse(buff.toString())
    t.same(block.root, null)
    t.same(block.msg, { text: 'test' })
  })
}
