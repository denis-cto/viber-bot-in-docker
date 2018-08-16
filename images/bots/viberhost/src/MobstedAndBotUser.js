import User from './userClass';
import Application from './applicationClass';

/** Class representing a MobstedAndBotUser - user in bots linked to Object. */
export default class MobstedAndBotUser {
    /**
     * Create or update existing mobsted object and link to botuser
     * @param {string} - bot name like vk, telegram without "bot"
     * @param {string} - botUser {from: {first_name: "denis", last_name: "volkov", id: 1293123}};
     * @param {string} - userParams {};
     * @param {string} - botParams {ApplicationId: 90, TenantName: "mobsted"};
     * @param {string} - startContext 4e78b54b5dcfac016638d82b70ff5cd62bda2627c79057256f31723c60fe8b0e (urlencoded json with objectId)
     */
    constructor(bot, botUser, userParams, botParams, startContext) {
        return new Promise((resolve,reject) => {
            console.debug('Mobsted And bot USER STARTCONTEXT')
            console.debug(startContext)
            var denis = new User(bot, {});
            denis.fillUserInstance(bot, botUser, botParams, userParams);
            console.log(denis);
            var application = new Application(denis.data.ApplicationId, denis.url);

            denis.getActualDataPromise().then(() => {
                return application.get();
            }).then(() => {
                if ( ([startContext].join('') !== '') && ([startContext].join('')!=='/start')) { //   если есть контекст в кнопке
                    //start context exists
                    console.log("startContext detected "+[startContext].join(''))
                    if ([denis.data.ObjectId].join('')!=='')  // а вдруг в базе уже был установлен  objectid
                    {
                        console.log('Trying to Get Context, but ObjectId already exists');
                        console.log([denis.data.ObjectId].join(''))
                    }
                    return denis.decryptStartContextToObjectIds(startContext)  // расшифруем строку
                }
                else {
                    if (typeof(denis.data.ObjectId) !== "undefined") // acltual ObjectId found
                        return denis.data.ObjectId;
                    else {
                        if (application.CreateObjects === 1)
                            return denis.createEmptyObjectPromise();  //no object id found, create a m
                        else reject("Application Settings undefined for allowing or not creating new objects");
                    }
                }

            }).then(result => {
                return denis.savePromise();
            }).then(response => {
                resolve(denis);
            }).catch(function genericError(error) {
                console.log('Generic ', error); // Error: Not Found
                reject(error);
            });
        });
    }
}


