import MobstedViberBot from './MobstedViberBot';
var log4js = require('log4js');
var logger = log4js.getLogger();
var configsrc = require('config');
var serverConfig = configsrc.get('server.config');
var host = serverConfig.host;
var port = parseInt(serverConfig.startingPortViber);
var url = host;
console.log(process.env)
new MobstedViberBot(url, process.env);
