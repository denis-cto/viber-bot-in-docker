/**
 * Created by denisvolkov on 01.06.17.
 */
var request = require('request-promise-native')
var models = require('./models.js')
var _ = require('lodash')
const querystring = require('querystring')
var routines = require('./routines')

var urlencode = require('urlencode')

module.exports = {
    updateSenderpoolStatus: function (id, status, channel, tenantName, applicationId) {

        return new Promise(function (resolve, reject) {
            var oldenv = process.env.NODE_ENV
            console.log('ENV WAS ' + process.env.NODE_ENV)
            process.env.NODE_ENV = 'ru' + '_' + tenantName + applicationId;
            console.log('ENV SET ' + process.env.NODE_ENV)
            var configSender = require('config-uncached');
            var apiConfig = configSender(true).get('api.config')
            var username = apiConfig.username
            var password = apiConfig.password
            var server = apiConfig.server
            var url = 'https://' + username + ':' + password + '@' + apiConfig.tenant +
                '.' + server
            console.log('Trying update senderpool at ' + url)
            var DateSend = new Date().toISOString().slice(0, 19).replace('T', ' ')
            if (status == 'success')
                var endpoint = url
            else if (status == 'failed')
                var endpoint = url
            console.log('TRying to Update Senderpool ID')
            console.log(endpoint);

            request.put(endpoint).then(response => {
                console.log('server responded to updatesenderplool this:')
                console.log(response)
                var res = JSON.parse(response)
                console.log(res)
                if (res.response) {
                    console.log('res.response exists')
                    var thenum = res.response.match(/\d+/)[0]
                    console.log(thenum)
                    if (thenum == 1) {
                        /// one record was updated!
                        console.log('One')
                        process.env.NODE_ENV = oldenv
                        console.log(process.env.NODE_ENV)
                        resolve(thenum)
                    }
                    else if (thenum == 0) {
                        process.env.NODE_ENV = oldenv
                        reject('updateSenderpoolStatus No records were updated')
                    }
                }
                else {
                    process.env.NODE_ENV = oldenv
                    reject('updateSenderpoolStatus Error occured' + response)
                }

            }).catch(function (err) {
                process.env.NODE_ENV = oldenv
                console.log('Error inside updateSenderpoolStatus')
                console.log(err)
                reject(err)

            })
        })
    },
}
