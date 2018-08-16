/**
 *  * Created by denisvolkov on 24.02.17.
 *   */
var express = require("express");
var telegramListenerServer = express();
var bodyParser = require("body-parser");
// telegramListenerServer.use(bodyParser.json());       // to support JSON-encoded bodies
telegramListenerServer.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var sendToTelegram = require('./telegram_sendmessage');

telegramListenerServer.post('/sendpush', function (req, res, next) {
    var token = req.body.token,
        messengerId = req.body.messengerId,
        text = req.body.text,
        senderpoolId = req.body.senderpoolId,
        channel = req.body.channel;
    sendToTelegram(token, messengerId, text);
    res.send("Message Accepted" + req);

});

telegramListenerServer.listen(9999, "telegramhost", function () {
    console.log("Express server listening on telegramhost 9999");
});
