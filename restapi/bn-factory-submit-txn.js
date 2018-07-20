'use strict';
/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * Composer 0.19.0
 * 
 * Demostrates the use of factory received in the BN connection using
 * the getFactory( ) method to submit a transaction
 * 
 * Pre-Req
 * 1. Start the fabric
 * 2. Deploy & start airlinev7
 * 3. Start the REST Server
 * 4. Make sure there is no Flight resource with id="AE101-05-12-2019"
 *    Delete it if you find one - Remember the code for CreateFlight
 *    Transaction has the flightId hardcoded :-)
 * 
 * Demo Steps
 * 1. Use the bn-connection-util to create the connection to airlinev7
 * 2. Get the Busines Network Definition from Runtime
 * 3. Get the factory from the Business Network definition
 * 4. Create a new Transaction instance
 * 5. Set the property values in the transaction object
 * 6. Submit the transaction
 */

// Constant values - change as per your needs
const namespace = "org.lloyds.market";
const transactionType = "SetupDemo";

// 1. Connect to lloyds-project-5
const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main(error) {

    // Check for error
    if (error) {
        console.log(error);
        process.exit(1);
    }

    // 2. Get the Business Network Definition
    let bnDef = bnUtil.connection.getBusinessNetwork();
    console.log("2. Received Definition from Runtime: ",
        bnDef.getName(), "  ", bnDef.getVersion());

    // 3. Get the factory
    let factory = bnDef.getFactory();

    // 4. Create an instance of transaction
    let options = {
        generate: false,
        includeOptionalFields: false
    }

    let PolicyId = "CCR Y0001PR0027820";
    let transaction = factory.newTransaction(namespace, transactionType, PolicyId, options);


    let followers = ["Dakota (DKT 7809)", "Bleachers Re (BRE 3290)", "Towers Inc (TWR 2244)"];

    // 5. Set up the properties of the transaction object
    transaction.setPropertyValue('PolicyNo', PolicyId);
    transaction.setPropertyValue('InsuredCompanyName', 'James Bowling Estates');
    transaction.setPropertyValue('PolicyType', 'CommercialProp');
    transaction.setPropertyValue('PolicyDetails1', 'ATL...');
    transaction.setPropertyValue('LeadCarrier', 'Fortitude (FRT 2100)');
    transaction.setPropertyValue('PlacingBroker', 'WideWorld Broking limited');
    transaction.setPropertyValue('ClaimsBroker', 'Lloyds Claim Broker');
    transaction.setPropertyValue('OverseasBroker', 'Lloyds Claim Broker');
    transaction.setPropertyValue('Followers', followers);

    transaction.setPropertyValue('PolicyEffectiveDate', new Date('2018-10-15T21:44Z'));
    transaction.setPropertyValue('PolicyExpiryDate', new Date('2019-10-15T21:44Z'));

    // 6. Submit the transaction
    return bnUtil.connection.submitTransaction(transaction).then(() => {
        console.log("6. Transaction Submitted/Processed Successfully!!")
        bnUtil.disconnect();

    }).catch((error) => {
        console.log(error);
        bnUtil.disconnect();
    });
}


/**
 * Test Data for adding flight in registry
 {
  "$class": "org.acme.airline.flight.Flight",
  "flightId": "AE101-05-05-2019",
  "flightNumber": "AE101",
  "route": {
    "$class": "org.acme.airline.flight.Route",
    "origin": "ATL",
    "destination": "EWR",
    "schedule": "2019-12-17T18:49:58.288Z",
    "id": "string"
  }
}


* Adding flight using the createFlight transaction
{
  "$class": "org.acme.airline.flight.CreateFlight",
  "flightNumber": "AE101-06-06-2019",
  "origin": "MSP",
  "destination": "SEA",
  "schedule": "2019-06-06T18:49:58.273Z"
}
*/