'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  displayName: 'string',
  username: {type: 'string', lowercase: true, unique: true},
  passwordHash: 'string',
  isAdmin: 'boolean'
})

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.passwordHash
    return ret
  }
})

userSchema.virtual('password').set(function (password) {
  this.passwordHash = bcrypt.hashSync(password, 10)
})

userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
