module.exports = {
    // Properties used for creating instance of the BN connection
    cardStore: require('composer-common').FileSystemCardStore,
    BusinessNetworkConnection: require('composer-client').BusinessNetworkConnection,
    // Used for connect()
    //cardName: "admin@lloyds-project-6",

    // Holds the Business Network Connection
    connection: {},

    // 1. This is the function that is called by the app
    connect: function (user, callback) {

        // Create instance of file system card store
        //const cardStore = new this.cardStore();
        //this.connection = new this.BusinessNetworkConnection({ cardStore: cardStore });
        var cardType = { type: 'composer-wallet-filesystem' }
        this.connection = new this.BusinessNetworkConnection(cardType);
        const cardName_new = getCardName(user);
        console.log("Card name is : ",cardName_new);
        

            // Invoke connect
            return this.connection.connect(cardName_new).then(function () {
                callback();
            }).catch((error) => {
                callback(error);
                console.log(error);
                connection.disconnect();
            });
    
    },

    // 2. Disconnects the bn connection
    disconnect: function (callback) {
        this.connection.disconnect();
    },

    // 3. Pings the network
    ping: function (callback) {
        return this.connection.ping().then((response) => {
            callback(response);
        }).catch((error) => {
            callback({}, error);
        });
    }
}


function getCardName(user) {
    switch (user) {
        case "ABCUW":
            return 'ABCUW@lloyds-project-2'
            break;
        case "GaingKim":
            return 'GaingKim@lloyds-project-2'
            break;
        default:
            return 'admin@lloyds-project-2'
    }
}

