/*jshint esversion: 6 */

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
// increase the limit
myEmitter.setMaxListeners(100);

module.exports = {
    // Properties used for creating instance of the BN connection
    cardStore: require('composer-common').FileSystemCardStore,
    BusinessNetworkConnection: require('composer-client').BusinessNetworkConnection,
    // Used for connect()

    // Holds the Business Network Connection
    connection: {},

    // 1. This is the function that is called by the app
    connect: function (req, res, callback) {
        console.log("*** dlt-connection-util ***");

        // Create instance of file system card store
        //const cardStore = new this.cardStore();
        //this.connection = new this.BusinessNetworkConnection({ cardStore: cardStore });
        var cardType = { type: 'composer-wallet-filesystem' }
        this.connection = new this.BusinessNetworkConnection(cardType);
        const user = req.headers["user"];

        if (user === undefined) {
            //res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            var jsonObj = [];

            jsonObj.push({
                "status": 'user header is undefined'
            });
            res.json({
                jsonObj
            });
        } else {
            const cardName_new = getCardName(user);
            console.log("*** dlt-connection-util card name ***", cardName_new);
            return this.connection.connect(cardName_new).then(function () {
                callback();
            }).catch((error) => {
                console.log(error);
                const cardName_new = getCardName(user);
                console.log("*** dlt-connection-util*** retry 1", cardName_new);
                return this.connection.connect(cardName_new).then(function () {
                    callback();
                }).catch((error) => {
                    console.log(error);
                    const cardName_new = getCardName(user);
                    console.log("*** dlt-connection-util card***  retry 2", cardName_new);
                    return this.connection.connect(cardName_new).then(function () {
                        callback();
                    }).catch((error) => {
                var jsonObj = [];

                jsonObj.push({
                    "status": 'Network issue, please try again.'
                });
                res.json({
                    jsonObj
                });
                callback(error);
                console.log(error);
                connection.disconnect();
            });
        });
    });
        }
    },

    // 2. Disconnects the bn connection
    disconnect: function (callback) {
      console.log("******Disconnect*******");

        return this.connection.disconnect();
    },

    // 3. Pings the network
    ping: function (callback) {
        return this.connection.ping().then((response) => {
            callback(response);
        }).catch((error) => {
            callback({}, error);
        });
    }
};


function getCardName(user) {

    return user.concat("@lloyds-project-6");
}

