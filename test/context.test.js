'use strict'

const test = require('ava').test
const sinon = require('sinon')
const LookupTokens = require('../index')

test.cb('LookupToken()', t => {
  t.plan(11)

  let mw = LookupTokens()
  let headers = getMockHeaders()

  let req = getMockReq({ headers })
  let res = getMockRes()

  mw(req, res, () => {
    t.is(req.slapp.meta.app_token, headers['bb-slackaccesstoken'])
    t.is(req.slapp.meta.app_user_id, headers['bb-slackuserid'])
    t.is(req.slapp.meta.app_bot_id, headers['bb-slackbotid'])
    t.is(req.slapp.meta.bot_token, headers['bb-slackbotaccesstoken'])
    t.is(req.slapp.meta.bot_user_id, headers['bb-slackbotuserid'])
    t.is(req.slapp.meta.bot_user_name, headers['bb-slackbotusername'])
    t.is(req.slapp.meta.team_name, headers['bb-slackteamname'])
    t.is(req.slapp.meta.team_domain, headers['bb-slackteamdomain'])
    t.is(req.slapp.meta.incoming_webhook_url, headers['bb-incomingwebhookurl'])
    t.is(req.slapp.meta.incoming_webhook_channel, headers['bb-incomingwebhookchannel'])
    t.is(typeof req.slapp.meta.config, 'object')
    t.end()
  })
})

test.cb('LookupToken() error header', t => {
  let mw = LookupTokens()
  let headers = getMockHeaders({
    'bb-error': 'kaboom'
  })

  let req = getMockReq({ headers })
  let res = getMockRes()

  mw(req, res, () => {
    t.is(req.slapp.meta.error, 'kaboom')
    t.end()
  })
})

test.cb('LookupToken() team config headers', t => {
  t.plan(2)

  let mw = LookupTokens()
  let headers = getMockHeaders({
    'bb-config-custom_token': 'customtokenvalue',
    'bb-config-custom_token2': 'customtoken2value'
  })

  let req = getMockReq({ headers })
  let res = getMockRes()

  mw(req, res, () => {
    t.is(req.slapp.meta.config['CUSTOM_TOKEN'], 'customtokenvalue')
    t.is(req.slapp.meta.config['CUSTOM_TOKEN2'], 'customtoken2value')
    t.end()
  })
})

test('LookupToken() missing req.slapp', t => {
  let mw = LookupTokens()
  let headers = getMockHeaders()

  let req = getMockReq({ headers })
  let res = getMockRes()

  delete req.slapp

  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => {
    t.fail()
  })

  t.true(sendStub.calledOnce)
})

function getMockReq (req) {
  return Object.assign({
    body: {},
    slapp: {
      meta: {}
    }
  }, req || {})
}

function getMockRes (res) {
  let mockRes = Object.assign({
    send: () => {},
    status: () => { return mockRes }
  }, res || {})

  return mockRes
}

function getMockHeaders (headers) {
  return Object.assign({
    'bb-slackaccesstoken': 'slackaccesstoken',
    'bb-slackuserid': 'slackuserid',
    'bb-slackbotid': 'slackbotid',
    'bb-slackbotaccesstoken': 'slackbotaccesstoken',
    'bb-slackbotuserid': 'slackbotuserid',
    'bb-slackbotusername': 'slackbotusername',
    'bb-slackteamname': 'slackteamname',
    'bb-slackteamdomain': 'slackteamdomain',
    'bb-incomingwebhookurl': 'incomingwebhookurl',
    'bb-incomingwebhookchannel': 'incomingwebhookchannel'
  }, headers || {})
}
