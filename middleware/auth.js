'use strict'

const config = require('../config.json')
const User = require('../schema/user')
const log = require('winston')

function validateSmtp (request, username, password, cb) {
  if (username !== 'smtp') {
    log.verbose(`SMTP login failed: Invalid username ${username}`)
    return cb(null, false)
  }
  if (password !== config.auth.smtpSecret) {
    log.verbose(`SMTP login failed: Invalid secret`)
    return cb(null, false)
  }
  log.verbose(`SMTP login successful`)
  cb(null, true, {username: 'smtp'})
}

async function getUser (username, password) {
  const user = await User.findOne({username: username.toLowerCase()})
  if (!user) return null
  if (await user.validatePassword(password)) {
    return user
  }
  return null
}

function validateUser (request, username, password, cb) {
  getUser(username, password).then((user) => {
    if (!user) {
      log.verbose(`User login as ${username} failed: Invalid username/password`)
      return cb(null, false)
    }
    log.verbose(`User login as ${username} successful`)
    cb(null, true, user)
  })
}

function validateAdmin (request, username, password, cb) {
  getUser(username, password).then((user) => {
    if (!user) {
      log.verbose(`Admin login as ${username} failed: Invalid username/password`)
      return cb(null, false)
    }
    if (!user.isAdmin) {
      log.verbose(`Admin login as ${username} failed: Not an admin`)
      return cb(null, false)
    }
    log.verbose(`Admin login as ${username} successful`)
    cb(null, true, user)
  })
}

exports.register = function (server, options, next) {
  server.auth.strategy('smtp', 'basic', {validateFunc: validateSmtp})
  server.auth.strategy('user', 'basic', {validateFunc: validateUser})
  server.auth.strategy('admin', 'basic', {validateFunc: validateAdmin})

  next()
}

exports.register.attributes = {
  name: 'auth'
}
