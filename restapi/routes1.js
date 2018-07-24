'use strict';

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-6';
const connection = new bnc();
var Client = require('node-rest-client').Client;
var restclient = new Client();
const fs = require('fs');

const bnUtil = require('./dlt-connection-util');
module.exports = (app) => {
    app.get('/', function (req, res) {
        res.end("Welcome to Lloyds Market DLT services");
    });


app.post('/Claim/new', (req, res) => {
    bnUtil.connect(req, () => {
        console.log("1. Claim/new")
        let bnDef = bnUtil.connection.getBusinessNetwork();
        console.log("2. Received Definition from Runtime: ", bnDef.getName(), "  ", bnDef.getVersion());
        let factory = bnDef.getFactory();
        let transaction = factory.newTransaction('org.lloyds.model', 'CreateClaim');
        
        transaction.setPropertyValue('ClaimNo', req.body.ClaimNo);
        transaction.setPropertyValue('ClaimCreatedBy', req.body.ClaimCreatedBy);
    
        transaction.setPropertyValue('ClaimMode', req.body.ClaimMode);
        transaction.setPropertyValue('ClaimDetails1', req.body.ClaimDetails1);
        transaction.setPropertyValue('ClaimDetails2', req.body.ClaimDetails2);
        transaction.setPropertyValue('ClaimPremiumStatus', req.body.ClaimPremiumStatus);
        transaction.setPropertyValue('ClaimActionRequired', req.body.ClaimActionRequired);
    
        transaction.setPropertyValue('ClaimCreateDate', new Date(req.body.ClaimCreateDate));
        transaction.setPropertyValue('ClaimDateofLoss', new Date(req.body.ClaimDateofLoss));
    
        transaction.setPropertyValue('PolicyNo', req.body.PolicyNo);
        transaction.setPropertyValue('owner', req.body.owner);
        transaction.setPropertyValue('LeadCarrier', req.body.LeadCarrier);
    
        transaction.setPropertyValue('PlacingBroker', req.body.PlacingBroker);
        transaction.setPropertyValue('ClaimsBroker', req.body.ClaimsBroker);
        transaction.setPropertyValue('OverseasBroker', req.body.OverseasBroker);
        transaction.setPropertyValue('PolicyOwner', req.body.PolicyOwner);
        transaction.setPropertyValue('Followers1', req.body.Followers1);
        transaction.setPropertyValue('Followers2', req.body.Followers2);
        transaction.setPropertyValue('Followers3', req.body.Followers3);
        transaction.setPropertyValue('Followers4', req.body.Followers4);


        // 6. Submit the transaction
        return bnUtil.connection.submitTransaction(transaction).then(() => {
            console.log("6. Transaction Submitted/Processed Successfully!!")
            res.end("Welcome to Lloyds Market DLT services");
            bnUtil.disconnect();

        }).catch((error) => {
            console.log(error);

            bnUtil.disconnect();
        });
    })
});
}