import MobstedAndBotUser from '../MobstedAndBotUser';
import Messages from './../messagesClass';
// var Telegraf = require('telegraf');
const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const Message = require('viber-bot').Message;
const KeyboardMessage = require('viber-bot').Message.Keyboard;
const RichMedia = require('viber-bot').Message.RichMedia;
const winston = require('winston');
const toYAML = require('winston-console-formatter'); // makes the output more friendly
function createLogger() {
  const logger = new winston.Logger({
    level: "silly",
  }); // We recommend DEBUG for development
  logger.add(winston.transports.Console, toYAML.config());
  return logger;
}

const logger = createLogger();
export default class MobstedViberBot {
  constructor(url, params) {
    this.Messages = new Messages('ru');
    this.user = 'undefined';
    this.url = url;
    //console.log('StartingBot for URL=', url);
    this.params = params;
    process.env.VIBER_PUBLIC_ACCOUNT_ACCESS_TOKEN_KEY = params.Token;
    var miniapp = new ViberBot({
      // path: '/bot/' + params.port,
      // logger: logger,
      authToken: params.Token,
      name: params.BotName,
      avatar: params.BotIcon
    });
    console.log('miniapp=');
    console.log(miniapp);
    this.miniapp = miniapp;
    // this.miniapp.params = this.params;
    // Set viber webhook
    const webhookurl = 'https://' + url + '/bot/' + params.port;
    console.log('WebhookUrl=' + webhookurl);
    // var fs = require('fs');
    // var keyfile = fs.readFileSync('keys/private.pem');
    // var certfile = fs.readFileSync('keys/cert.pem');
    // var cafile = fs.readFileSync('keys/ca.pem');
    var that = this;
    // var httpOptions= { key:keyfile, cert: certfile,ca:cafile}
    var viberListenerServer = require('http');
    viberListenerServer.createServer(this.miniapp.middleware()).listen(params['port'], () => {
      that.miniapp.setWebhook(webhookurl).catch(function (e) {
        console.warn('NO WEBHOOK SET! Problem IS HERE!')
        console.log(e);
      });
    });
    var that = this;
    this.miniapp.onConversationStarted((userProfile, subscribed, contextMessage, onFinish) => {
      console.log('CONVERSATION STARTED')
      this.onStartCommand(userProfile, subscribed, contextMessage, onFinish);
    });
    this.miniapp.on(BotEvents.MESSAGE_RECEIVED, (message, request) => {
      console.log('----');
      console.log(message.toJson().type);
      console.log('----')
      switch (message.toJson().type) {
        case 'picture': {
          this.onPictureMessageRecieved(message, request);
          break;
        }
        case 'text': {
          this.onTextMessageRecieved(message, request);
          break;
        }
        case 'file': {
          this.onFileMessageRecieved(message, request);
          break;
        }
        case 'video': {
          this.onVideoMessageRecieved(message, request);
          break;
        }
      }
    });
  }

  registerUser(userProfile, startContext) {
    var ctx = {  // transoft data to unified format
      from: {
        first_name: userProfile.name,
        last_name: '',
        id: userProfile.id,
      },
    };
    var that = this;
    return new MobstedAndBotUser('viber', ctx, {}, {
      "ApplicationId": that.params.ApplicationId,
      "TenantName": that.params.TenantName,
    }, startContext)
  }

  onStartCommand(userProfile, subscribed, contextMessage, onFinish) {
    //Conversation started event fires when a user opens a conversation with the Public Account/ bot using the “message” button (found on the account’s info screen) or using a deep link.
    //This event is not considered a subscribe event and doesn’t allow the account to send messages to the user; however, it will allow sending one “welcome message” to the user
    console.log('contextMessage')
    console.log(contextMessage)
    var that = this
    this.registerUser(userProfile, contextMessage).then(user => {
      // user.decryptStartContextToObjectIds(contextMessage);
      onFinish(new Message.Text(that.Messages.Hello(userProfile.name)));
      that.registerUserMessageAndReplyWithLink(userProfile, user, that.Messages.UserJoinedSelfMessage('viber'))
    });
  }

  myAccountButtonOption(link, icon) {
    var SAMPLE_RICH_MEDIA = {
      "ButtonsGroupColumns": 6,
      "ButtonsGroupRows": 1,
      "BgColor": "#FFFFFF",
      "Buttons": [
        //     {
        //     "ActionBody": link,
        //     "ActionType": "open-url",
        //     "BgMediaType": "picture",
        //     "Image": icon,
        //     "BgColor": "#000000",
        //     "TextOpacity": 60,
        //     "Rows": 6,
        //     "Columns": 6,
        // },
        {
          "ActionBody": link,
          "ActionType": "open-url",
          "BgColor": "#85bb65",
          "Text": this.Messages.MyAccount(),
          "TextOpacity": 60,
          "Rows": 1,
          "Columns": 6,
        }],
    };
    var message = new RichMedia(SAMPLE_RICH_MEDIA);
    return message;
  }

  onTextMessageRecieved(message, request) {
    console.log('THIS IS MESSAGE' + message);
    console.log(message);
    var userProfile = request.userProfile;
    var that = this;
    this.registerUser(userProfile).then(user => {
      that.registerUserMessageAndReplyWithLink(userProfile, user, message.text)
    });
  }

  onPictureMessageRecieved(message, request) {
    var userProfile = request.userProfile;
    var that = this;
    this.registerUser(userProfile).then(user => {
      that.registerUserMessageAndReplyWithLink(userProfile, user, "<a href='" + message.toJson().media + "'><img src='" + message.toJson().thumbnail + "'></a>")
    });
  }

  onFileMessageRecieved(message, request) {
    var userProfile = request.userProfile;
    var that = this;
    this.registerUser(userProfile).then(user => {
      that.registerUserMessageAndReplyWithLink(userProfile, user, "<a href='" + message.toJson().media + "'>" + message.toJson().file_name + "</a>")
    });
  }

  onVideoMessageRecieved(message, request) {
    var userProfile = request.userProfile;
    var that = this;
    this.registerUser(userProfile).then(user => {
      var tag = '<video width="320" height="240" controls poster="' + message.toJson().thumbnail + '">  <source src="' + message.toJson().media + '" type="video/mp4">        </video>';
      that.registerUserMessageAndReplyWithLink(userProfile, user, tag)
    });
  }

  registerUserMessageAndReplyWithLink(userProfile, user, incomingText) {
    console.log('inside registerUserMessageAndReplyWithLink ');
    var that = this;
    var icon = '';
    console.log('Going to send TEXT');
    console.log(incomingText);
    if (incomingText === 'whereareyoufrom?') that.miniapp.sendMessage(userProfile, new Message.Text(JSON.stringify(process.env)))
    return user.sendMessage(incomingText).then(body => {
      console.log(body);
      if (body != '') {
        var link = JSON.parse(body);
        console.log(link);
        var thanks = that.Messages.ThanksForYourMessage();
        console.log(thanks);
        that.miniapp.sendMessage(userProfile, new Message.Text(thanks)).then(() => {
          var myacc = that.myAccountButtonOption(link.response, icon);
          that.miniapp.sendMessage(userProfile, myacc).then(() => {
              console.log('THEN HAPPENED');
              user.sendMessageAsBot(that.Messages.ThanksForYourMessage() + ' <a href="' + link.response + '">' + that.Messages.MyAccount() + '</a>')
            }
          ).catch(function (e) {
            console.log(e)
          });
        }).catch(function (e) {
          console.log(e)
        });
        // ctx.reply(that.Messages.ThanksForYourMessage(), that.myAccountButtonOption(link));
      }
      else {
        var notdelivered = that.Messages.MessageWasNotDelivered();
        that.miniapp.sendMessage(userProfile, new Message.Text(notdelivered)).then(() => {
            console.log('THEN HAPPENED');
            user.sendMessageAsBot(notdelivered)
          }
        );
      }
    }).catch(function (e) {
      console.log(e);
      if (e.statusCode === 410) {
        that.miniapp.sendMessage(userProfile, new Message.Text('You are not registered in application. Press "/start" to register')).then(() => {
            console.log('THEN HAPPENED');
            user.sendMessageAsBot('You are not registered in application. Press "/start" to register')
          }
        );
      }
      else {
        that.miniapp.sendMessage(userProfile, new Message.Text('We cannot recieve your message, something is broken. Please try again later.')).then(() => {
            console.log('THEN HAPPENED');
            user.sendMessageAsBot('We cannot recieve your message, something is broken. Please try again later.')
          }
        );
      }
      console.log('onTextMessageRecieved exception');
    });
  }
}

