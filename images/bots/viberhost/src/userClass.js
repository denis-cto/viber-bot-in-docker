/**
 * Created by denisvolkov on 01.06.17.
 */
var request = require('request-promise-native')
var models = require('./models.js')
var _ = require('lodash')
const querystring = require('querystring')
var config = require('config')
var routines = require('./routines')
var apiConfig = config.get('api.config')
var username = apiConfig.username
var password = apiConfig.password
var server = apiConfig.server
const url = 'https://' + username + ':' + password + '@' + apiConfig.tenant + '.' + server
var urlencode = require('urlencode')
export default class User {

    constructor(bot, data) {
        this.data = this.sanitize(data)   // removes data that is not in model
        this.bot = bot
        this.userUrl = url + '/api/v5/' + bot + 'users'   // e.g. telgramusers, viberusers
        this.chatUrl = url + '/api/v5/chat/sendmessage'
        this.chatAsBotUrl = url + '/api/v5/chat/sendmessageasbot'
        this.objectUrl = url + '/api/v4/objects'
        this.shortlinkUrl = url + '/api/v6/applications/shortlink'
        this.isNewuser = 'undefined'
        this.url = url
        this.headers = {
            'User-Agent': 'NodeJS Chatbot by Mobsted.com',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    async getActualDataPromise() {
        try {
            let endpoint = this.userUrl + '/messengerid'
            let data = {
                'id': this.data.MessengerId,
                'TenantName': this.data.TenantName,
                'ApplicationId': this.data.ApplicationId
            }
            let formData = querystring.stringify(data)


            var options = {
                method: 'POST',
                uri: endpoint,
                form: formData,
                headers: this.headers,
            }

            let response = await request.post(options)
            let userdata = this.extractActualData(response)
            if (userdata) {
                Object.assign(this.data, userdata)
                this.data.isNewUser = false
            }
            else
                this.data.isNewUser = false

            return this

        } catch (err) {
            console.log('Error inside get getActualDataPromise', err)

        }


    }

    sanitize(data) {
        data = data || {}
        var model = models.user  // load model default fields
        data = _.pick(_.defaults(data, model), _.keys(model))   // removes data that is not in model
        data = _.omitBy(data, _.isNil) // remove null and undefined values
        return data
    }

    fillUserInstance(channel, botUser, BotParams, UserParams) {
        this.data = {
            'Name': botUser.from.first_name + ' ' + botUser.from.last_name,
            'ApplicationId': BotParams.ApplicationId,
            'TenantName': BotParams.TenantName,
            'MessengerId': botUser.from.id,
            'ObjectId': routines.has(UserParams, 'ObjectId')
                ? UserParams.ObjectId
                : null,
            'Details': JSON.stringify(
                {
                    'Lastname': botUser.from.last_name,
                    'Blocked': routines.has(UserParams, 'Blocked')
                        ? UserParams.Blocked
                        : false,
                    'BlockedDate': routines.has(UserParams, 'BlockedDate')
                        ? UserParams.BlockedDate
                        : null,
                    'PhoneVerified': routines.has(UserParams, 'PhoneVerified')
                        ? UserParams.PhoneVerified
                        : false,
                    'VerifiedPhones': routines.has(UserParams, 'VerifiedPhones')
                        ? UserParams.VerifiedPhones
                        : false,
                }),
        }
        return true
    }

    async createEmptyObjectPromise() {
        try {
            console.log('Creating Empty user')
            var data = {
                'ApplicationId': this.data.ApplicationId,
                'Enabled': '1',
            }
            var formData = querystring.stringify(data)
            var endpoint = this.objectUrl
            var options = {
                method: 'POST',
                uri: endpoint,
                form: formData,
                headers: this.headers,
            }
            let response = await request.post(options)
            let objectId = parseInt(response)
            if (objectId)
                this.data.ObjectId = parseInt(response)
            else
                console.error('Cant parse ObjectID. Reponse was ' + response)
        }
        catch (err) {
            console.error('Error inside createEmptyObject')
            console.log(err)
        }

    }

    async generateAppLoginLinkPromise() {
        try {

            var urlencode = require('urlencode')

            var endpoint = this.shortlinkUrl + '?Path=' +
                querystring.escape('/applications/newlink') + '&Params=' + urlencode(
                    JSON.stringify({
                        'appid': this.data.ApplicationId,
                        'objid': this.data.ObjectId,
                        'srcChannel': this.bot,
                    }))
            let response = await request(endpoint)
            return response

        }
        catch (err) {
            console.error('Error inside get generateAppLoginLinkPromise data')
            console.error(err)
            return false
            // Request failed...
        }
    }

    extractActualData(response) {
        console.log(response)

        var actualData = JSON.parse(response)
        console.log('------')
        console.log('Extracting Actual data from response')
        console.log(actualData[0])
        console.log('------')
        if (!this.isEmpty(actualData)) {  // some data came to us
            if (!actualData.ErrorNNumber) {
                return actualData[0]
            }
            else {
                if (actualData.ErrorText) {
                    console.error(actualData.ErrorText)
                    return false
                }
                else
                    return false
            }
        }
        else {
            return false
        }
    }

    async savePromise()  // userData is JSON based
    {
        try {
            var data = {
                'create': JSON.stringify(
                    {
                        'MessengerId': this.data.MessengerId,
                    }),
                'update': JSON.stringify(this.sanitize(this.data)),
            }
            var formData = querystring.stringify(data)
            var endpoint = this.userUrl + '/createupdate'
            var options = {
                method: 'POST',
                uri: endpoint,
                form: formData,
                headers: this.headers,
            }
            let body = await request.post(options)
        }
        catch (err) {
            console.log('Request failed', err)
            return false
        }
    }

    async sendMessage(incomingText, asBot = false)  // userData is JSON based
    {
        try {
            var data = {
                'MessengerId': this.data.MessengerId,
                'Channel': this.bot,
                'EventId': 0,
                'Message': incomingText,
                'AplicationId': this.data.ApplicationId,
            }
            console.log('DATA IS')
            console.log(data)
            let formData = querystring.stringify(data)
            let endpoint = ''
            if (asBot === true)
                endpoint = this.chatAsBotUrl
            else
                endpoint = this.chatUrl
            let options = {
                method: 'POST',
                uri: endpoint,
                form: formData,
                headers: this.headers,
            }
            let body = await request.post(options)
            var res = JSON.parse(body)
            console.log('res is ', res)
            if (typeof(res.ErrorNNumber) === 'undefined')
                return body
            else {
                console.log('Request failed1', body)
                return false
            }
        }
        catch (error) {
            console.log('Request failed2', error)
            return false
        }

    }
  sendMessageAsBot(incomingText)  // userData is JSON based
  {
    var that = this;
    return new Promise(function (resolve, reject) {
      // var data = "MessengerId="+urlencode(this.data.MessengerId)+"&Channel="+urlencode(this.bot)+"&EventId=0" + "&Message=" + urlencode(incomingText);
      var data = {
        'MessengerId': that.data.MessengerId,
        'Channel': that.bot,
        'EventId': 0,
        'Message': incomingText,
        'AplicationId': that.data.ApplicationId,
      };
      var formData = querystring.stringify(data);
      var contentLength = formData.length;
      var headers = {
        'User-Agent': 'NodeJS Chatbot by Mobsted.com',
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      var endpoint = that.chatAsBotUrl;
      var options = {
        method: 'POST',
        uri: endpoint,
        form: formData,
        headers: headers,
      };
      request.post(options).then(body => {
        var res = JSON.parse(body);
        console.log('res is ', res);
        if (typeof(res.ErrorNNumber) === 'undefined')
          resolve(body);
        else {
          console.log('Request failed1', body);
          reject(body);
        }
      }).catch(error => {
        console.log('Request failed2', error);
        reject(error);
      });
    });
  };
    async findObjectsByPhone(phone, params, callback)  // userData is JSON based
    {
        var endpoint = this.objectUrl + '/exists/?ApplicationId=' +
            params['ApplicationId'] + '&Phone=' + phone
        let [error, response, body] = await request.get(endpoint)
        if (!error && response.statusCode == 200) {
            return callback(null, body)
        } else
            return callback(error, body)

    }

    isPhoneVerified() {
        console.log('Inside isPhoneVerified')
        if (typeof this.details !== 'undefined' && this.details) {
            console.log('Inside ??!!')
            if (typeof this.details.PhoneVerified !== 'undefined' &&
                this.details.PhoneVerified) {
                if (this.details.PhoneVerified === true) {
                    return true
                }
                else {
                    return false
                }
            } else return false
        } else
            return false
    }

    isEmpty(obj) {
        return Object.keys(obj).length === 0
    }


    async decryptStartContextToObjectIds(contextText) {

        try {
            var text = contextText
            var data = 'encryptedText=' + urlencode(text)
            var endpoint = '';
            console.log('DATA')
            console.log(data)
            console.log('ENDPOINT')
            console.log(endpoint)
            let [error, response, body] = await request.get(endpoint, {form: data})
            if (!error && response.statusCode === 200) {
                console.log('Got decrypted data')
                console.log(body)
                var result = JSON.parse(body)
                console.log(result)
                let val = parseInt(result[0])
                if (val !== isNaN()) {
                    this.data.ObjectId = val
                    console.log('ASSIGNED OBJECTID FROM CONTEXT' + val)
                    return val
                }
                else return false
            }
            else {
                return false
            }
        }
        catch (e) {

            console.log('Rejected in descypting context')
            console.error(e)
            return false
        }
    }


    //


}
