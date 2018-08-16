var request = require('request-promise-native');

export default  class Application {

    constructor(applicationId,url) {
        this.applicationId=applicationId;
        this.applicationUrl=url + '/api/v4/applications';
        this.CreateObjects='undefined';
    }
    get()
    {
        var that = this;
        return new Promise(function (resolve, reject) {
            var endpoint = that.applicationUrl + '/' + that.applicationId;
            request(endpoint).then(response => {
                var Application = JSON.parse(response);
                if (Application===false)
                {
                    console.log("Application not exists");
                    reject("Application not exists");
                }
                Object.assign(that,Application);
                resolve(Application);
            }).catch(function (err) {
                reject(err);
                // Request failed...
            });
        });
    }
}
