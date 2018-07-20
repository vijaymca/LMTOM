'use strict';
/**
1. Create claim
 */
const bnUtil = require('./dlt-connection-util');

bnUtil.connect("admin", () => {
    console.log("Event subscription started");
    bnUtil.connection.on('event',(event)=>{
        var namespace = event.$namespace;
        var eventtype = event.$type;

        var fqn = namespace+'.'+eventtype;
        console.log("Event 1",fqn);

        // #3 Filter the events
        switch(fqn){
            
            
            case    'org.lloyds.model.CreateClaimCreated':        
                    // #3 Process the event
                    counter++;
                    console.log('Event#',counter);
                    processFlightCreatedEvent(fqn, event);
                    break;
            default:    
                    console.log("Ignored event: ", fqn);
        }
    });    

});

function processFlightCreatedEvent(fqn, event){

    console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    var arr3 = [ event.PolicyNo, event.ClaimNo,event.ClaimDateofLoss,event.LeadCarrier,
                event.PlacingBroker,event.ClaimsBroker,event.OverseasBroker,event.PolicyOwner,event.Followers1,event.Followers2];
    console.log(arr3);

    bnUtil.connect("admin", () => {
        console.log("Getting regristries");
  
    
    });
    




    };