'use strict';
const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-1';
const connection = new bnc();
main();

async function main(error) {

  var key;
  var arr = ['ABCUW', 'ABCUW', 'ABCUW'];
  for (key in arr) {
    console.log("Event subscription started");
    await myFun();

  }
}

function myFun() {
  return new Promise((resolve, reject) => {
    connection.connect(cardName).then(function () {
      console.log("Event1");

      connection.getParticipantRegistry('org.lloyds.market._Party')
        .then(function (playerRegistry) {
          return playerRegistry.exists('ABCUW')
        })
        .then(function (exists) {
          if (!exists) {
            throw Error('Invalid participant id')
          } else {
            resolve(connection.getAssetRegistry('org.lloyds.market._Party')
              .then(function (assetRegistry) {
                console.log("participant exists");
                connection.disconnect();
              })
            );
          }
        });
    });


  });

}