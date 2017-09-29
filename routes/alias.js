'use strict'

const Alias = require('../schema/alias')
const Boom = require('boom')

async function getAliases (request, reply) {
  let q = {userId: request.auth.credentials._id}
  if (request.query.name) {
    q.name = request.query.name.toLowerCase()
  }
  if (request.query.comment) {
    q.comment = request.query.comment
  }
  if (request.query.active) {
    q.active = request.query.active
  }

  reply(await Alias.find(q))
}

async function getAlias (request, reply) {
  const q = {name: request.params.name.toLowerCase(), userId: request.auth.credentials._id}
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply(Boom.notFound(`Alias ${q.name} not found`))
  }
  reply(alias)
}

async function getAliasFor (request, reply) {
  const q = {usedfor: request.params.for.toLowerCase()}
  if (request.auth.credentials.username !== 'smtp') {
    q.userId = request.auth.credentials._id
  }
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply(Boom.notFound(`Alias ${q.name} not found`))
  }
  reply(alias)
}

async function createAlias (request, reply) {
  const payload = request.payload
  payload.userId = request.auth.credentials._id
  const newAlias = new Alias(payload)
  const alias = await newAlias.save()
  reply(alias)
}

async function addFor (request, reply) {
  const q = {name: request.params.name.toLowerCase()}
  if (request.auth.credentials.username !== 'smtp') {
    q.userId = request.auth.credentials._id
  }
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply(Boom.notFound(`User ${q.username} not found`))
  }

  if (alias.usedfor.indexOf(request.payload.for) === -1) {
    alias.usedfor.push(request.payload.for)
    await alias.save()
  }
  reply(alias)
}

async function updateAlias (request, reply) {
  reply('NYI')
}

module.exports = [
  {
    method: 'GET',
    path: '/aliases',
    config: {auth: 'user'},
    handler: getAliases
  },
  {
    method: 'GET',
    path: '/aliases/for/{for}',
    config: {auth: {strategies: ['smtp', 'user']}},
    handler: getAliasFor
  },
  {
    method: 'GET',
    path: '/aliases/{name}',
    config: {auth: 'user'},
    handler: getAlias
  },
  {
    method: 'POST',
    path: '/aliases',
    config: {auth: 'user'},
    handler: createAlias
  },
  {
    method: 'PUT',
    path: '/aliases/{name}',
    config: {auth: 'user'},
    handler: updateAlias
  },
  {
    method: 'POST',
    path: '/aliases/{name}/for',
    config: {auth: {strategies: ['smtp', 'user']}},
    handler: addFor
  }
]
