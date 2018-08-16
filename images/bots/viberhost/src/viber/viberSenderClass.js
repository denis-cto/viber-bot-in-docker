/**
 *  * Created by denisvolkov on 24.02.17.
 *   */
var express = require("express");
var viberListenerServer = express();
var bodyParser = require("body-parser");
var Ajv = require('ajv'); // jSON SCHEMA VALIDATOR
var routines = require('./../routines');
var request = require('request-promise-native')
const ViberBot = require('viber-bot').Bot;
const TextMessage = require('viber-bot').Message.Text;

var senderpool = require('./../senderpool');
var colors = require('colors/safe'); // does not alter string prototype
var log4js = require('log4js');
var logger = log4js.getLogger();

// viberListenerServer.use(bodyParser.json());       // to support JSON-encoded bodies
viberListenerServer.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
}));
export default class ViberSender {
    constructor() {
        var that = this;
        viberListenerServer.post('/sendpush', function (req, response) {
            that.sendToViber(req, response);
        });
        viberListenerServer.listen(9999, "viberhost", function () {
            console.log("Express server listening on viberhost 9999");
        });
    }

    sendToViber(req, response) {
        (async () => {
            try {
                var token = req.body.token,
                    messengerId = req.body.messengerId,
                    text = req.body.text,
                    senderpoolId = req.body.senderpoolId,
                    channel = req.body.channel,
                    tenantName = req.body.tenantName,
                    applicationId = req.body.applicationId,
                    oldenv = process.env.NODE_ENV

                process.env.NODE_ENV = 'ru' + '_' + tenantName + applicationId;

                var configSender = require('config-uncached'),
                    apiConfig = configSender(true).get('api.config'),
                    username = apiConfig.username,
                    password = apiConfig.password,
                    server = apiConfig.server,
                    url = 'https://' + username + ':' + password + '@' + apiConfig.tenant +
                        '.' + server
                console.log('Trying update senderpool at ' + url)
            var endpoint=url+'/api/v5/viberbots?query=%5B%7B%22field%22%3A%22Token%22%2C%22operation%22%3A%22%3D%22%2C%22value%22%3A%22'+token+'%22%2C%22andor%22%3A%22and%22%7D%5D'
                var botData = await request.get(endpoint);
                botData=JSON.parse(botData)
                botData=botData[0]

                var bot = new ViberBot({
                    authToken: token,
                    name: botData.Name,
                    avatar: botData.IconUrl
                });
                console.log('BOT IS')
                console.log(bot)
                var message = new TextMessage(text);
                var userProfile = {
                    id: messengerId,
                    // name: 'Волков Денис',
                    // avatar: 'https://media-direct.cdn.viber.com/download_photo?dlid=yU8gz2ii9AHfEu1FbiPZsjUUajpZngdQrxZAPHBBF-QrwHbmwZRzpkA8iVLa6HkjXRyGbIdUDN9cucgKzbdGcW9LE30mb3WfobBDnshBajT4uPQoY8Ws47FVDRs&fltp=jpg&imsz=0000',
                    // country: 'RU',
                    // language: 'en',
                    // apiVersion: 2
                };
                await bot.sendMessage(userProfile, message).then(() => {
                    console.log('send to bot!')
                }).catch(err => {
                    console.log('Bot sendmessages failed...ups')
                });

                response.json({'status': 'ok'});
                response.end();
                console.log('RESPONDED')
                await senderpool.updateSenderpoolStatus(senderpoolId, 'success', 'viber', tenantName, applicationId).then(() => {
                    console.log(
                        'SUCCESS'
                    )
                }).catch(function (reason) {
                    console.log('CACTHED')
                    response.json(reason);
                    console.log('Promise post Rejected', reason);
                    return senderpool.updateSenderpoolStatus(senderpoolId, 'failed',
                        'viber', tenantName, applicationId).catch(err => {
                        console.log('err inside err')
                    });
                });
            } catch (e)
            {
                console.error(e);
            }
        })();
    };

}


