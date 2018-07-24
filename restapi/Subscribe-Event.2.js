'use strict';
const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-1';
const connection = new bnc();
main();

function main(error){

    console.log("Event subscription started");

    connection.connect(cardName).then(function () {
        console.log("Event1");
        
        connection.getParticipantRegistry('org.lloyds.market._Party')
        .then(function (participantRegistry) {
          return participantRegistry.get('ABCUW');
        }).then(function (driver) {
            console.log("Event3");
          // Process the the driver object.
          console.log(driver.Email);
          connection.disconnect();
        })
        .catch(function (error) {
          // Add optional error handling here.
          connection.disconnect();
        }); 
    }); 
    };