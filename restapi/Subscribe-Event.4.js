'use strict';
const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-1';
const connection = new bnc();
main();

function main(error){

    console.log("Event subscription started");
    var key;
    var arr = ['ABCUW','ABCUW','ABCUW'];
    for (key in arr) {
 
        connection.connect(cardName).then(function () {
        console.log("Event1");
        
          return connection.getParticipantRegistry('org.lloyds.market._Party')
        .then(function(playerRegistry) {
          return playerRegistry.exists(arr[key])
        })
         .then(function(exists) {
          if(!exists) {
            throw Error('Invalid participant id')
          } else {
          return connection.getParticipantRegistry('org.lloyds.market._Party')
            .then(function (assetRegistry) {
              console.log("participant exists");
              connection.disconnect();
 
         });
          }
        }); 
    });
  }

    };