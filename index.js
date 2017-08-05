const crypto = require('crypto')

const nonce = () => crypto.randomBytes(32).toString('hex')

const required = ['setRoot', 'getRoot', 'timestamp', 'validate']

class AbstractLedger {
  constructor (store) {
    this.store = store
    this._root = null
    this._ledger = []
    for (let method of required) {
      if (!this[method]) throw new Error(`Class must implement ${method}.`)
    }
  }
  async append (msg, root) {
    let _root = await this.getRoot()
    if (_root !== root) throw new Error('Root mismatch.')
    await this.validate(msg)
    let block = {msg, root, nonce: nonce(), time: await this.timestamp()}
    let hash = await this.store.set(Buffer.from(JSON.stringify(block)))
    await this.setRoot(root, hash, block.time)
    return hash
  }
}

class InMemoryLedger extends AbstractLedger {
  async getRoot () {
    return this._root
  }
  async setRoot (old, hash, time) {
    if (this._root === old) {
      this._ledger.push([time, hash])
      this._root = hash
    } else {
      throw new Error('old hash must match current hash.')
    }
  }
  async timestamp () {
    return Date.now()
  }
  async validate (msg) {
    // Must throw if invalid.
    if (msg) return true
    throw new Error('validation error.')
  }
}

module.exports = store => new InMemoryLedger(store)
module.exports.AbstractLedger = AbstractLedger
module.exports.InMemoryLedger = InMemoryLedger
