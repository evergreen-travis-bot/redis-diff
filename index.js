'use strict'

const arrayDiff = require('simple-array-diff')
const json = require('json-future')
const redis = require('redis')

const exists = (val) => val != null
const noop = () => {}

function createDiff (opts) {
  const client = redis.createClient(opts)

  function set (opts, cb = noop) {
    const {key, value} = opts
    if (!exists(key)) return cb(TypeError('Need to provide a key.'))
    if (!exists(value)) return cb(TypeError('Need to provide a value.'))

    json.stringifyAsync(value, function (err, stringified) {
      if (err) return cb(err)
      return client.set(key, stringified, cb)
    })
  }

  function get (opts, cb = noop) {
    const {key} = opts
    if (!exists(key)) return cb(TypeError('Need to provide a key.'))

    client.get(key, function (err, value) {
      if (err) return cb(err)
      return json.parseAsync(value, cb)
    })
  }

  function compare (opts, cb = noop) {
    const {key, value, id} = opts
    if (!exists(key)) return cb(TypeError('Need to provide a key.'))
    if (!exists(value)) return cb(TypeError('Need to provide a value.'))
    if (!exists(id)) return cb(TypeError('Need to provide a id.'))

    get({key}, function (err, data) {
      if (err) return cb(err)
      return cb(null, arrayDiff(data, value, id))
    })
  }

  return {set, get, compare}
}

module.exports = createDiff