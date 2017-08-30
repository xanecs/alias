'use strict'

const User = require('../schema/user')
const Boom = require('boom')

async function getUsers (request, reply) {
  let q = {}
  if (request.query.username) {
    q.username = request.query.name
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

module.exports = [
  {
    method: 'GET',
    path: '/users',
    config: {auth: 'admin'},
    handler: getUsers
  },
  {
    method: 'GET',
    path: '/users/{username}',
    config: {auth: 'admin'},
    handler: getUser
  },
  {
    method: 'GET',
    path: '/users/me',
    config: {auth: 'user'},
    handler: getMe
  },
  {
    method: 'POST',
    path: '/users',
    config: {auth: 'admin'},
    handler: createUser
  },
  {
    method: 'PUT',
    path: '/users/{username}',
    config: {auth: 'admin'},
    handler: updateUser
  },
  {
    method: 'PUT',
    path: '/users/me',
    config: {auth: 'user'},
    handler: updateMe
  }
]
