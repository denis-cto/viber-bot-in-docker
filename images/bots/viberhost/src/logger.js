/**
 * Created by denisvolkov on 30.05.17.
 */
'use strict';
const winston = require('winston');
const toYAML = require('winston-console-formatter');


function createLogger() {
    const logger = new winston.Logger({
        level: "debug"
    });

    logger.add(winston.transports.Console, toYAML.config());
    return logger;
}
var logger = createLogger();
module.exports=logger;
