#!/usr/bin/env node
'use strict'

const config = require('../config.json')
const mongoose = require('mongoose')
const readline = require('readline')
const User = require('../schema/user')

mongoose.connect(config.db, {useMongoClient: true}, (err) => {
  if (err) throw err
})

if (process.argv.length < 3) {
  console.error(`Please specify a username to create`)
  process.exit(1)
}

const username = process.argv[2]

if (process.argv.length < 4) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question(`Password for ${username}: `, (answer) => createUser(username, answer))
} else {
  createUser(username, process.argv[3])
}

function createUser (username, password) {
  const nUser = new User({username, password, isAdmin: true})
  nUser.save((err, user) => {
    if (err) throw err
    console.log(user)
    process.exit(0)
  })
}
