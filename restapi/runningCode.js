'use strict';

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@eventnetwork';
const connection = new bnc();
main2();


function main(){
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;
        console.log("********* SampleAsset")
        return connection.connect(cardName).then(function(){
            var   statement = 'SELECT org.example.basic.SampleAsset';
            return connection.buildQuery(statement);
            })
            
            .then((qry)=>{
                return connection.query(qry,);
            }).then((results1)=>{
                connection.disconnect();             
                           
                console.log(results1)
                });
           
    };

function main1(){
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        var flightRegistry={}
        var flightId = 'AE101-05-27-18';
        const cardName_new = 'admin@airlinev8';
        connection.connect(cardName_new).then(function () {
            const bnDef = connection.getBusinessNetwork();
            const factory = bnDef.getFactory();
            let    transaction = factory.newTransaction('org.acme.airline.flight','AssignAircraft');
            transaction.setPropertyValue('flightId',"AE101-05-27-1");
            transaction.setPropertyValue('aircraftId', "CRAFT001");
            return connection.submitTransaction(transaction).then(()=>{
            
                return connection.getAssetRegistry('org.acme.airline.flight'+"."+'Flight')
            }).then((registry)=>{
                flightRegistry=registry;
                return registry.get(flightId)
                
            }).then((asset)=>{
                // Check if the aircraft ID is set for the flight
                console.log(asset)
                connection.disconnect();  
            }).catch((error) => {
                console.log(error);
                connection.disconnect();
            });
;

        });
               
        };



function main2(){
            var jsonObj = [];
            var results1;
            var results2;
            var claim_obj;
            var policy_obj;
            var ClaimRegistry={}
            var ClaimNo = '341XZ70011';
            const cardName_new = 'admin@lloyds-project-1';
            connection.connect(cardName_new).then(function () {
                const bnDef = connection.getBusinessNetwork();
                const factory = bnDef.getFactory();
                let    transaction = factory.newTransaction('org.lloyds.model','CreateClaim');
                transaction.setPropertyValue('ClaimNo',ClaimNo);
                transaction.setPropertyValue('ClaimCreatedBy', "Towers");

                transaction.setPropertyValue('ClaimMode', "Open");
                transaction.setPropertyValue('ClaimDetails1', "Lorem ipsum dolor sit amet");
                transaction.setPropertyValue('ClaimDetails2', "Lorem ipsum dolor sit amet");
                transaction.setPropertyValue('ClaimPremiumStatus', "Paid");
                transaction.setPropertyValue('ClaimActionRequired', "Yes");
                
                transaction.setPropertyValue('ClaimCreateDate', new Date("2018-07-17T09:03:42.115Z"));
                transaction.setPropertyValue('ClaimDateofLoss', new Date("2018-07-17T09:03:42.115Z"));

                transaction.setPropertyValue('PolicyNo', "CCR K0001FR0020000");
                transaction.setPropertyValue('owner', "Bleachers");
                transaction.setPropertyValue('LeadCarrier', "Bleachers");

                transaction.setPropertyValue('PlacingBroker', "Bleachers");
                transaction.setPropertyValue('ClaimsBroker', "Bleachers");
                transaction.setPropertyValue('OverseasBroker', "Bleachers");
                transaction.setPropertyValue('PolicyOwner', "Bleachers");
                transaction.setPropertyValue('Followers1', "Bleachers");
                transaction.setPropertyValue('Followers2', "Bleachers");
                transaction.setPropertyValue('Followers3', "Bleachers");
                transaction.setPropertyValue('Followers4', "Bleachers");

                return connection.submitTransaction(transaction).then(()=>{
                
                    return connection.getAssetRegistry('org.lloyds.market'+"."+'Claim')
                }).then((registry)=>{
                    ClaimRegistry=registry;
                    return registry.get(ClaimNo)
                    
                }).then((asset)=>{
                    // Check if the aircraft ID is set for the flight
                    console.log(asset)
                    connection.disconnect();  
                }).catch((error) => {
                    console.log(error);
                    connection.disconnect();
                });
    ;
    
            });
                   
            };

function main3(){
            var jsonObj = [];
            var results1;
            var results2;
            var claim_obj;
            var policy_obj;
            var ClaimRegistry={}
            var ClaimNo = '341XZ70011';
            const cardName_new = 'admin@lloyds-project-1';
            connection.connect(cardName_new).then(function () {
                const bnDef = connection.getBusinessNetwork();
                const factory = bnDef.getFactory();
                let    transaction = factory.newTransaction('org.lloyds.model','CreateClaim');
                transaction.setPropertyValue('ClaimNo',ClaimNo);
                transaction.setPropertyValue('ClaimCreatedBy', "Towers");

                transaction.setPropertyValue('ClaimMode', "Open");
                transaction.setPropertyValue('ClaimDetails1', "Lorem ipsum dolor sit amet");
                transaction.setPropertyValue('ClaimDetails2', "Lorem ipsum dolor sit amet");
                transaction.setPropertyValue('ClaimPremiumStatus', "Paid");
                transaction.setPropertyValue('ClaimActionRequired', "Yes");
                
                transaction.setPropertyValue('ClaimCreateDate', new Date("2018-07-17T09:03:42.115Z"));
                transaction.setPropertyValue('ClaimDateofLoss', new Date("2018-07-17T09:03:42.115Z"));

                transaction.setPropertyValue('PolicyNo', "CCR K0001FR0020000");
                transaction.setPropertyValue('owner', "Bleachers");
                transaction.setPropertyValue('LeadCarrier', "Bleachers");

                transaction.setPropertyValue('PlacingBroker', "Bleachers");
                transaction.setPropertyValue('ClaimsBroker', "Bleachers");
                transaction.setPropertyValue('OverseasBroker', "Bleachers");
                transaction.setPropertyValue('PolicyOwner', "Bleachers");
                transaction.setPropertyValue('Followers1', "Bleachers");
                transaction.setPropertyValue('Followers2', "Bleachers");
                transaction.setPropertyValue('Followers3', "Bleachers");
                transaction.setPropertyValue('Followers4', "Bleachers");

                return connection.submitTransaction(transaction).then(()=>{
                
                    return connection.getAssetRegistry('org.lloyds.market'+"."+'Claim')
                }).then((registry)=>{
                    ClaimRegistry=registry;
                    return registry.get(ClaimNo)
                    
                }).then((asset)=>{
                    // Check if the aircraft ID is set for the flight
                    console.log(asset)
                    connection.disconnect();  
                }).catch((error) => {
                    console.log(error);
                    connection.disconnect();
                });
    ;
    
            });
                   
            };            