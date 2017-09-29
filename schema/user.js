'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  displayName: String,
  username: {type: String, lowercase: true, unique: true},
  passwordHash: String,
  isAdmin: Boolean
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
