'use strict'

// Enrich `req.slapp.meta` with context parsed from Beep Boop headers
module.exports = () => {
  return function contextMiddleware (req, res, next) {
    if (!req.slapp) {
      return res.send('Missing req.slapp')
    }

    req.slapp.meta = Object.assign(req.slapp.meta || {}, {
      // token for the user for the app
      app_token: req.headers['bb-slackaccesstoken'],
      // userID for the user who install ed the app
      app_user_id: req.headers['bb-slackuserid'],
      // botID for the Slack App (different from the bots userID)
      app_bot_id: req.headers['bb-slackbotid'],
      // token for a bot user of the app
      bot_token: req.headers['bb-slackbotaccesstoken'],
      // userID of the bot user of the app
      bot_user_id: req.headers['bb-slackbotuserid'],
      // additional bot and team meta-data
      bot_user_name: req.headers['bb-slackbotusername'],
      team_name: req.headers['bb-slackteamname'],
      team_domain: req.headers['bb-slackteamdomain'],
      // Beep Boop specific ID for App/Team association
      team_resource_id: req.headers['bb-slackteamresourceid'],
      // Incoming webhook props
      incoming_webhook_url: req.headers['bb-incomingwebhookurl'],
      incoming_webhook_channel: req.headers['bb-incomingwebhookchannel'],
      error: req.headers['bb-error']
    })

    // Add custom config
    req.slapp.meta.config = Object.keys(req.headers)
      .filter(header => /^bb-config-/.test(header))
      .reduce((config, header) => {
        let name = header.substr('bb-config-'.length).toUpperCase()
        config[name] = req.headers[header]
        return config
      }, {})

    next()
  }
}
