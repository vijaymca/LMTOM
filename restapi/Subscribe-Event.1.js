const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-1';
const connection = new bnc();
main();

function main(error){

    console.log("Event subscription started");
    console.log("Received:")
    // #2 Subscribe to event


    connection.on('event',(event)=>{
        var namespace = event.$namespace;
        var eventtype = event.$type;

        var fqn = namespace+'.'+eventtype;

        // #3 Filter the events
        switch(fqn){
            case    'org.lloyds.model.CreateClaimCreated':        
                    // #3 Process the event
                    
                    console.log('Event#',counter);
                    processClaimCreatedEvent(fqn, event);
                    break;
            default:    
                    console.log("Ignored event: ", fqn);
        }
    });
       
        
}

/**
 * This is the event processing function that can be coded to carry out any action
 * that the subscriber intends to take. E.g., when the Claim is scheduled the travel
 * agent will open it up on their site for ticket sale.
 * @param {*} fqn 
 * @param {*} event 
 */
function processClaimCreatedEvent(fqn, event){

    console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    var partyArray = [ event.LeadCarrier,event.PlacingBroker,event.ClaimsBroker,event.OverseasBroker,event.PolicyOwner,event.Followers1,event.Followers2];
    console.log(partyArray);

    
    for (party in partyArray) {
        console.log(party.Email);
   }



};



