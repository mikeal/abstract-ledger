const promisify = require('util').promisify
const crypto = require('crypto')

const nonce = () => crypto.randomBytes(32).toString('hex')

const propPromise = (inst, prop) => {
  return promisify((...args) => inst[prop](...args))
}

class AbstractLedger {
  constructor (store) {
    this.store = store
    this._get = propPromise(store, 'getBuffer')
    this._set = propPromise(store, 'set')
    this._root = null
    this._ledger = []
  }
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
  async append (msg, root) {
    let _root = await this.getRoot()
    if (_root !== root) throw new Error('Root mismatch.')
    await this.validate(root, msg)
    let block = {msg, root, nonce: nonce(), time: await this.timestamp()}
    let hash = await this._set(Buffer.from(JSON.stringify(block)))
    await this.setRoot(root, hash, block.time)
    return hash
  }
  async timestamp () {
    return Date.now()
  }
  async validate (lastBlock, msg) {
    // Must throw if invalid.
    if (msg) return true
    throw new Error('validation error.')
  }
}

module.exports = store => new AbstractLedger(store)
module.exports.AbstractLedger = AbstractLedger
