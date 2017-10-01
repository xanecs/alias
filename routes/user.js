'use strict'

const User = require('../schema/user')
const Boom = require('boom')
const Joi = require('joi')

async function getUsers (request, reply) {
  let q = {}
  if (request.query.username) {
    q.username = request.query.username
  }
  if (request.query.displayName) {
    q.displayName = request.query.displayName
  }

  reply(await User.find(q))
}

async function getUser (request, reply) {
  const q = {username: request.params.username}
  const user = await User.findOne(q)
  if (!user) {
    return reply(Boom.notFound(`User ${q.username} not found`))
  }
  reply(user)
}

async function getMe (request, reply) {
  reply(request.auth.credentials)
}

async function createUser (request, reply) {
  const newUser = new User(request.payload)
  const user = await newUser.save()
  reply(user)
}

async function updateUser (request, reply) {
  const q = {username: request.params.username}
  const user = await User.findOne(q)
  if (!user) {
    return reply(Boom.notFound(`User ${q.username} not found`))
  }

  Object.assign(user, request.payload)
  reply(await user.save())
}

async function updateMe (request, reply) {
  const user = request.auth.credentials
  if (!user.isAdmin && request.payload.isAdmin) {
    return reply(Boom.badRequest('You cannot make yourself an admin'))
  }
  Object.assign(user, request.payload)
  reply(await user.save())
}

async function authenticateUser (request, reply) {
  const user = await User.findOne({username: request.payload.username})
  if (user && await user.validatePassword(request.payload.password)) {
    return reply({valid: true, user})
  }
  return reply({valid: false})
}

const userPayloadValidation = {
  username: Joi.string().alphanum().lowercase().trim().required(),
  displayName: Joi.string().trim().required(),
  password: Joi.string().required(),
  isAdmin: Joi.boolean().required()
}

module.exports = [
  {
    method: 'GET',
    path: '/users',
    config: {
      auth: 'admin',
      tags: ['api'],
      validate: {
        query: {
          username: Joi.string().alphanum().lowercase().trim(),
          displayName: Joi.string()
        }
      }
    },
    handler: getUsers
  },
  {
    method: 'POST',
    path: '/authenticate',
    config: {
      auth: 'smtp',
      tags: ['api'],
      validate: {
        payload: {
          username: Joi.string().alphanum().lowercase().trim(),
          password: Joi.string().required()
        }
      }
    },
    handler: authenticateUser
  },
  {
    method: 'GET',
    path: '/users/{username}',
    config: {
      auth: 'admin',
      tags: ['api'],
      validate: {
        params: {
          username: Joi.string().alphanum().lowercase().trim().required()
        }
      }
    },
    handler: getUser
  },
  {
    method: 'GET',
    path: '/users/me',
    config: {
      auth: 'user',
      tags: ['api']
    },
    handler: getMe
  },
  {
    method: 'POST',
    path: '/users',
    config: {
      auth: 'admin',
      tags: ['api'],
      validate: {
        payload: userPayloadValidation
      }
    },
    handler: createUser
  },
  {
    method: 'PUT',
    path: '/users/{username}',
    config: {
      auth: 'admin',
      tags: ['api'],
      validate: {
        params: {
          username: Joi.string().lowercase().trim().required()
        },
        payload: userPayloadValidation
      }
    },
    handler: updateUser
  },
  {
    method: 'PUT',
    path: '/users/me',
    config: {
      auth: 'user',
      tags: ['api'],
      validate: {
        payload: userPayloadValidation
      }
    },
    handler: updateMe
  }
]
