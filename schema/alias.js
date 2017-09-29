'use strict'

const mongoose = require('mongoose')

const aliasSchema = new mongoose.Schema({
  name: {type: String, unique: true, lowercase: true},
  usedfor: [{type: String, lowercase: true}],
  isActive: {type: Boolean, default: true},
  comment: String,
  userId: mongoose.Schema.Types.ObjectId
})

const aliasModel = mongoose.model('Alias', aliasSchema)

module.exports = aliasModel
