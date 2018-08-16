import MobstedViberBot from './MobstedViberBot';
import ViberSender from './viberSenderClass';
import BotList from './../listBotsClass';
var colors = require('colors/safe'); // does not alter string prototype
var log4js = require('log4js');
var logger = log4js.getLogger();
var configsrc = require('config');
var serverConfig = configsrc.get('server.config');
var host = serverConfig.host;
var port = parseInt(serverConfig.startingPortViber);
var url = host;//+'/bot/'+process.env['port'];
console.log(process.env)
new MobstedViberBot(url, process.env);
