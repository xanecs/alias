'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  displayName: 'string',
  username: 'string',
  passwordHash: 'string',
  isAdmin: 'boolean'
})

userSchema.virtual('password').set(function(password) {
  this.passwordHash = bcrypt.hashSync(password);
})

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash)
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
