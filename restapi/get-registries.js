'use strict';
/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * Composer 0.19.0
 * 
 * Demostrates the getter functions for the registries
 * 1. Use the bn-connection-util to connect
 * 2. Get & Print the Asset Registries
 * 3. Get & Print the Participant Registries
 * 4. Get & Print the Transaction Registries
 * 5. Get & Print the Historian Registry
 * 6. Get & Print the Identity  Registriy
 */
const bnUtil = require('./dlt-connection-util');

// This creates the business network connection object
// and calls connect() on it. Calls the callback method 
// 'main' with error


bnUtil.connect("admin", () => {
    return bnUtil.connection.getParticipantRegistry('org.lloyds.market._Party')
    .then(function (participantRegistry) {
      // Get the specific driver from the driver participant registry.
      return participantRegistry.get('admin');
    })
    .then(function (driver) {
      // Process the the driver object.
      console.log(driver.Email);
      bnUtil.connection.disconnect();
    })
    .catch(function (error) {
      // Add optional error handling here.
    }); 
});



