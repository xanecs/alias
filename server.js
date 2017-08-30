const hapi = require('hapi')
const http2 = require('http2')
const fs = require('fs')
const mongoose = require('mongoose')
const basic = require('hapi-auth-basic')
const log = require('winston')

const config = require('./config.json')
log.level = 'verbose'

mongoose.connect(config.db, {useMongoClient: true}, (err) => {
  if (err) throw err
  log.info(`Database connection established to ${config.db}`)
})

const options = {
  cert: fs.readFileSync(config.tls.cert),
  key: fs.readFileSync(config.tls.key),
  ca: config.tls.ca ? null : fs.readFileSync(config.tls.ca)
}

const server = new hapi.Server()
server.connection({
  listener: http2.createServer(options),
  host: config.host,
  port: config.port,
  tls: true
})

server.register([
  basic,
  require('./middleware/auth')
], (err) => {
  if (err) throw err
})

server.route(require('./routes/user'))

server.start((err) => {
  if (err) throw err
  const host = config.host.indexOf(':') > -1 ? `[${config.host}]` : config.host
  log.info(`Server running on https://${host}:${config.port}`)
})

process.on('uncaughtException', (err) => {
  log.error(err)
  process.exit(1)
})
