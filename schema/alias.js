'use strict'

const mongoose = require('mongoose')

const aliasSchema = new mongoose.Schema({
  name: {type: 'string', unique: true, lowercase: true},
  usedfor: [{type: 'string', lowercase: true}],
  isActive: {type: 'boolean', default: true},
  comment: 'string',
  userId: mongoose.Schema.Types.ObjectId
})

const aliasModel = mongoose.model('Alias', aliasSchema)

module.exports = aliasModel
