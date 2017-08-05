const crypto = require('crypto')

const nonce = () => crypto.randomBytes(32).toString('hex')

const required = ['setRoot', 'getRoot', 'timestamp']

class AbstractLedger {
  constructor (store) {
    this.store = store
    this._validations = []
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
  addValidation (fn) {
    this._validations.push(fn)
  }
  async validate (msg) {
    await Promise.all(this._validations.map(v => v(msg)))
    return true
  }
}

class InMemoryLedger extends AbstractLedger {
  constructor (store) {
    super(store)
    this._root = null
  }
  async getRoot () {
    return this._root
  }
  async setRoot (old, hash, time) {
    if (this._root === old) {
      this._root = hash
    } else {
      throw new Error('old hash must match current hash.')
    }
  }
  async timestamp () {
    return Date.now()
  }
}

module.exports = store => new InMemoryLedger(store)
module.exports.AbstractLedger = AbstractLedger
module.exports.InMemoryLedger = InMemoryLedger
