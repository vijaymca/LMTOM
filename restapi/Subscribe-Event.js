const bnUtil = require('./bn-connection-util');

// #1 Connect to the airlinev8
bnUtil.cardName = 'admin@lloyds-project-11';
bnUtil.connect(main);

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-11';
const connection = new bnc();

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gaingKim.xlabs@gmail.com',
        pass: '8drowssap'
    }
});


function main(error) {

    console.log("Event subscription started");
    // #2 Subscribe to event
    bnUtil.connection.on('event', (event) => {
        var namespace = event.$namespace;
        var eventtype = event.$type;

        var fqn = namespace + '.' + eventtype;

        // #3 Filter the events
        switch (fqn) {
            case 'org.lloyds.model.CreateClaimCreated':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.CreateClaimCreated');
                processClaimCreatedEvent(fqn, event);
                break;
            case 'org.lloyds.model.ClaimSettlementAmountUpdated':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.ClaimSettlementAmountUpdated');
                processClaimSettlementAmount(fqn, event);
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
async function processClaimSettlementAmount(fqn, event) {

    //console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    
    if (event.ClaimSettlementAmount.Status == "Completed"){
    var partyArray = [event.LeadCarrier, event.PlacingBroker, event.ClaimsBroker, event.OverseasBroker, event.PolicyOwner, event.Followers1, event.Followers2];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = "";
        text = `Hi, The policy holder  : ${event.PolicyOwner},has accepted to settle the claim for : ${event.ClaimSettlementAmount.Amount} ,  under Claim No:  ${event.ClaimNo} .`;
        sendEmail('gaingKim.xlabs@gmail.com', email, 'Claim Settlement Alert', text);
    }

}
if (event.ClaimSettlementAmount.Status == "Pending"){
    var partyArray = [event.PolicyOwner];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = "";
        if (event.ClaimSettlementAmount.Status == "Approved")
             text = `Hi, The lead carrier : ${event.LeadCarrier},has accepted to settle the claim for : ${event.ClaimSettlementAmount.Amount} ,  under Claim No:  ${event.ClaimNo} .Please check the claim and confirm the settlement amount.`;
        sendEmail('gaingKim.xlabs@gmail.com', email, 'Claim Settlement Alert', text);
    }

}



}


/**
 * This is the event processing function that can be coded to carry out any action
 * that the subscriber intends to take. E.g., when the Claim is scheduled the travel
 * agent will open it up on their site for ticket sale.
 * @param {*} fqn 
 * @param {*} event 
 */
async function processClaimCreatedEvent(fqn, event) {

    //console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    var partyArray = [event.LeadCarrier, event.PlacingBroker, event.ClaimsBroker, event.OverseasBroker, event.PolicyOwner, event.Followers1, event.Followers2];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `A new claim has been registered under Policy No: ${event.PolicyNo}, Insured : ,  Claim No is ${event.ClaimNo} , date of loss is ${event.ClaimDateofLoss}`;

        sendEmail('gaingKim.xlabs@gmail.com', email, 'A new claim alert', text);
    }
}


function sendEmail(from, email, subject, text) {

    var mailOptions = {
        from: from,
        to: email,
        subject: subject,
        html: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

async function getEmail(party) {
    return new Promise((resolve, reject) => {
        connection.connect(cardName).then(function () {
            console.log("Event1", party);

            connection.getParticipantRegistry('org.lloyds.market._Party')
                .then(function (playerRegistry) {
                    return playerRegistry.exists(party)
                })
                .then(function (exists) {
                    if (exists) {
                        resolve(connection.getParticipantRegistry('org.lloyds.market._Party')
                            .then(function (assetRegistry) {
                                return assetRegistry.get(party);
                            })
                            .then(function (driver) {
                                // Process the the driver object.
                                console.log(driver.Email);
                                connection.disconnect();
                                return driver.Email;

                            })
                        );
                    }
                    connection.disconnect();
                });

        });


    });

}


