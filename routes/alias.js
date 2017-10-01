'use strict'

const Alias = require('../schema/alias')
const User = require('../schema/user')
const Boom = require('boom')
const Joi = require('joi')
const config = require('../config.json')

async function getAliases (request, reply) {
  let q = {userId: request.auth.credentials._id}
  if (request.query.name) {
    q.name = request.query.name
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
  const q = {name: request.params.name}
  if (request.auth.credentials.username !== 'smtp') {
    q.userId = request.auth.credentials._id
  }
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply(Boom.notFound(`Alias ${q.name} not found`))
  }
  reply(alias)
}

async function resolveAlias (request, reply) {
  const q = {name: request.payload.name}
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply({valid: false})
  }
  const user = await User.findById(alias.userId)
  reply({valid: alias.isActive, user: user.username, host: config.domains[0]})
  const from = request.payload.from
  if (alias.usedfor.indexOf(from) < 0) {
    alias.usedfor.push(from)
    await alias.save()
  }
}

async function getAliasFor (request, reply) {
  const q = {usedfor: request.params.for}
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
  const q = {name: request.params.name}
  if (request.auth.credentials.username !== 'smtp') {
    q.userId = request.auth.credentials._id
  }
  const alias = await Alias.findOne(q)
  if (!alias) {
    return reply(Boom.notFound(`Alias ${q.name} not found`))
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

const aliasPayloadValidation = {
  name: Joi.string().email().lowercase().trim().required(),
  comment: Joi.string().optional(),
  usedfor: Joi.array().items(Joi.string().email().lowercase().trim())
}

module.exports = [
  {
    method: 'GET',
    path: '/aliases',
    config: {
      auth: 'user',
      tags: ['api'],
      validate: {
        query: {
          name: Joi.string().email().lowercase().trim(),
          comment: Joi.string(),
          active: Joi.boolean()
        }
      }
    },
    handler: getAliases
  },
  {
    method: 'GET',
    path: '/aliases/for/{for}',
    config: {
      auth: {strategies: ['smtp', 'user']},
      tags: ['api'],
      validate: {
        params: {
          for: Joi.string().email().lowercase().trim().required()
        }
      }
    },
    handler: getAliasFor
  },
  {
    method: 'GET',
    path: '/aliases/{name}',
    config: {
      auth: {strategies: ['smtp', 'user']},
      tags: ['api'],
      validate: {
        params: {
          name: Joi.string().email().lowercase().trim().required()
        }
      }
    },
    handler: getAlias
  },
  {
    method: 'POST',
    path: '/aliases/resolve',
    config: {
      auth: 'smtp',
      tags: ['api'],
      validate: {
        payload: {
          name: Joi.string().email().lowercase().trim().required(),
          from: Joi.string().email().lowercase().trim().required()
        }
      }
    },
    handler: resolveAlias
  },
  {
    method: 'POST',
    path: '/aliases',
    config: {
      auth: 'user',
      tags: ['api'],
      validate: {
        payload: aliasPayloadValidation
      }
    },
    handler: createAlias
  },
  {
    method: 'PUT',
    path: '/aliases/{name}',
    config: {
      auth: 'user',
      tags: ['api'],
      validate: {
        payload: aliasPayloadValidation,
        params: {
          name: Joi.string().email().lowercase().trim().required()
        }
      }
    },
    handler: updateAlias
  },
  {
    method: 'POST',
    path: '/aliases/{name}/for',
    config: {
      auth: {strategies: ['smtp', 'user']},
      tags: ['api'],
      validate: {
        params: {
          name: Joi.string().email().lowercase().trim().required()
        },
        payload: {
          for: Joi.string().email().lowercase().trim().required()
        }
      }
    },
    handler: addFor
  }
]
