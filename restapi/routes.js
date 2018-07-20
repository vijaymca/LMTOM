'use strict';
/**
1. Create claim
 */
const bnUtil = require('./dlt-connection-util');

bnUtil.connect("admin", () => {
    let bnDef = bnUtil.connection.getBusinessNetwork();
    console.log("2. Received Definition from Runtime: ", bnDef.getName(), "  ", bnDef.getVersion());
    let factory = bnDef.getFactory();
    let transaction = factory.newTransaction('org.lloyds.model', 'CreateClaim');

    transaction.setPropertyValue('ClaimNo', "75");
    transaction.setPropertyValue('ClaimCreatedBy', "Towers");

    transaction.setPropertyValue('ClaimMode', "Open");
    transaction.setPropertyValue('ClaimDetails1', "Lorem ipsum dolor sit amet");
    transaction.setPropertyValue('ClaimDetails2', "Lorem ipsum dolor sit amet");
    transaction.setPropertyValue('ClaimPremiumStatus', "Paid");
    transaction.setPropertyValue('ClaimActionRequired', "Yes");

    transaction.setPropertyValue('ClaimCreateDate', new Date("2018-07-17T09:03:42.115Z"));
    transaction.setPropertyValue('ClaimDateofLoss', new Date("2018-07-17T09:03:42.115Z"));

    transaction.setPropertyValue('PolicyNo', "CCR K0001FR0020000");
    transaction.setPropertyValue('owner', "ABCUW");
    transaction.setPropertyValue('LeadCarrier', "ABCUW");

    transaction.setPropertyValue('PlacingBroker', "ABCUW");
    transaction.setPropertyValue('ClaimsBroker', "ABCUW");
    transaction.setPropertyValue('OverseasBroker', "ABCUW");
    transaction.setPropertyValue('PolicyOwner', "GaingKim");
    transaction.setPropertyValue('Followers1', "GaingKim");
    transaction.setPropertyValue('Followers2', "GaingKim");
    transaction.setPropertyValue('Followers3', "GaingKim");
    transaction.setPropertyValue('Followers4', "GaingKim");

    // 6. Submit the transaction
    return bnUtil.connection.submitTransaction(transaction).then(() => {
        console.log("6. Transaction Submitted/Processed Successfully!!")

        bnUtil.disconnect();

    }).catch((error) => {
        console.log(error);

        bnUtil.disconnect();
    });
});

