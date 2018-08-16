/**
 * Created by denisvolkov on 01.06.17.
 */
var Globalize = require('globalize');
Globalize.load(require('cldr-data').entireSupplemental());
Globalize.load(require('cldr-data').entireMainFor('en', 'ru'));
Globalize.loadMessages(require('./messages/en'));
Globalize.loadMessages(require('./messages/ru'));
// Set "en" as our default locale.
export default class Messages {
    constructor(language) {
        if (typeof(language)==='undefined') language='en';
        Globalize.locale(language);
        this.globalize=Globalize;
    }

     Hello(userName) {
        return this.globalize.formatMessage('Hello') + ',' + userName + '!';
    }

     MessageWasNotDelivered() {
        return this.globalize.formatMessage('Your message was not delivered, ups... Try again');
    }

     ThanksForYourMessage() {
        return this.globalize.formatMessage('We have recieved your message and respond you ASAP. Press this button to enter your Account');
    }

    MyAccount() {
        return this.globalize.formatMessage('My Account');
    }
    UserJoinedSelfMessage(botName)
    {
        return this.globalize.formatMessage('User joined')+' '+botName;
    }
}
