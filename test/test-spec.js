const abstractLedger = require('../')
const inmem = require('lucass/inmemory')

const createLedger = () => abstractLedger(inmem())

const spec = require('./spec')
spec('abstract', createLedger)
