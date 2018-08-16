const bnUtil = require('./bn-connection-util');

// #1 Connect to the airlinev8
bnUtil.cardName = 'admin@lloyds-project-4';
bnUtil.connect(main);

var js2xmlparser = require("js2xmlparser");
fs = require('fs');

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-4';
const connection = new bnc();

const NS = "org.lloyds.market";
const NS_model = "org.lloyds.model";
const NS_PARTY = 'org.lloyds.market._Party';
const NS_CLAIM = 'org.lloyds.market.Claim';
const NS_POLICY = 'org.lloyds.market.Policy';

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lmtom.notification@gmail.com',
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
            case 'org.lloyds.model.EventclaimConflict':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.EventclaimConflict');
                processEventclaimConflict(fqn, event);
                break;

            case 'org.lloyds.model.ClaimSettlementAmountUpdated':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.ClaimSettlementAmountUpdated');
                processClaimSettlementAmount(fqn, event);
                break;

            case 'org.lloyds.model.EventclaimSegment':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.EventclaimSegment');
                processEventclaimSegment(fqn, event);
                break;

            case 'org.lloyds.model.EventclaimPremCheck':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.EventclaimPremCheck');
                processEventclaimPremCheck(fqn, event);
                break;

            case 'org.lloyds.model.Eventclaimhousekeep':
                // #3 Process the event
                console.log('Event#', 'org.lloyds.model.Eventclaimhousekeep');
                processEventclaimhousekeep(fqn, event);
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
async function processEventclaimhousekeep(fqn, event) {

    var partyArray = [event.owner];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `Hi, Claim No: ${event.ClaimNo} ,has been assigned to you, for confirming the fraud/sanction.  Please verify the details and confirm. Insured :  ${event.PolicyOwner}`;
        sendEmail('lmtom.notification@gmail.com', email, 'Alert : Premium Check', text);
    }

    generateXML(event.ClaimNo);
}

/**
 * This is the event processing function that can be coded to carry out any action
 * that the subscriber intends to take. E.g., when the Claim is scheduled the travel
 * agent will open it up on their site for ticket sale.
 * @param {*} fqn 
 * @param {*} event 
 */
async function processEventclaimPremCheck(fqn, event) {

    var partyArray = [event.owner];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `Hi, Claim No: ${event.ClaimNo} ,has been assigned to you, for confirming the premium details.  Please verify the details and confirm. Insured :  ${event.PolicyOwner}`;
        sendEmail('lmtom.notification@gmail.com', email, 'Alert : Premium Check', text);
    }
}


/**
 * This is the event processing function that can be coded to carry out any action
 * that the subscriber intends to take. E.g., when the Claim is scheduled the travel
 * agent will open it up on their site for ticket sale.
 * @param {*} fqn 
 * @param {*} event 
 */
async function processEventclaimConflict(fqn, event) {

    //console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    var partyArray = [event.owner, event.ClaimsBroker, event.Followers1, event.Followers2, event.Followers1, event.Followers2];
    //console.log(partyArray);
    if (event.ClaimMode === 'Approved') {
        for (var x in partyArray) {
            const email = await getEmail(partyArray[x])
            console.log("After await --> ", email);
            let text = `Hi, The lead carrier  ${event.owner}, has confirmed that there is no conflict of interest.`;

            sendEmail('lmtom.notification@gmail.com', email, 'Alert : Conflict of Interest – Yes', text);
        }
    }

    else {

        for (var x in partyArray) {
            const email = await getEmail(partyArray[x])
            console.log("After await --> ", email);
            let text = `Hi, The lead carrier  ${event.owner},has confirmed that there is a conflict of interest.   The claim will be passed to the next follower for confirming the conflict of interest.`;
            sendEmail('lmtom.notification@gmail.com', email, 'Alert : Conflict of Interest – No', text);
        }
    }
}

/**
 * This is the event processing function that can be coded to carry out any action
 * that the subscriber intends to take. E.g., when the Claim is scheduled the travel
 * agent will open it up on their site for ticket sale. EventclaimSegment
 * @param {*} fqn 
 * @param {*} event 
 */
async function processClaimSettlementAmount(fqn, event) {

    //console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);

    if (event.ClaimSettlementAmount.Status == "Completed") {
        var partyArray = [event.LeadCarrier, event.PlacingBroker, event.ClaimsBroker, event.OverseasBroker, event.PolicyOwner, event.Followers1, event.Followers2];
        //console.log(partyArray);
        for (var x in partyArray) {
            const email = await getEmail(partyArray[x])
            console.log("After await --> ", email);
            var text = "";
            text = `Hi, The lead carrier : ${event.PolicyOwner}, has accepted to settle the claim for : ${event.ClaimSettlementAmount.Amount} ,  under Claim No:  ${event.ClaimNo} ..`;
            sendEmail('lmtom.notification@gmail.com', email, 'Claim Settlement Alert', text);
        }

    }
    if (event.ClaimSettlementAmount.Status == "Pending") {
        var partyArray = [event.PolicyOwner];
        //console.log(partyArray);
        for (var x in partyArray) {
            const email = await getEmail(partyArray[x])
            console.log("After await --> ", email);
            var text = "";
            text = `Hi, The lead carrier : ${event.LeadCarrier}, has accepted to settle the claim for : ${event.ClaimSettlementAmount.Amount} ,  under Claim No:  ${event.ClaimNo} .Please check the claim and confirm the settlement amount.`;

            sendEmail('lmtom.notification@gmail.com', email, 'Claim Settlement Alert', text);
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
async function processEventclaimSegment(fqn, event) {

    //console.log(fqn, ' ', event.PolicyNo, ' ', event.ClaimNo, ' ', event.ClaimDateofLoss);
    var partyArray = [event.LeadCarrier, event.ClaimsBroker, event.Followers1, event.Followers2];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `Hi, Segmentation of claim for Claim No: ${event.ClaimNo} , has been done by the lead carrier  ${event.LeadCarrier}`;

        sendEmail('lmtom.notification@gmail.com', email, 'Alert : Claim Segmentation', text);
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
    var partyArray = [event.LeadCarrier, event.PlacingBroker, event.ClaimsBroker, event.OverseasBroker, event.Followers1, event.Followers2];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `A new claim has been registered under Policy No: ${event.PolicyNo}, Insured : ,  Claim No is ${event.ClaimNo} , date of loss is ${event.ClaimDateofLoss}`;

        sendEmail('lmtom.notification@gmail.com', email, 'A new claim alert', text);
    }

    var partyArray = [event.LeadCarrier];
    //console.log(partyArray);
    for (var x in partyArray) {
        const email = await getEmail(partyArray[x])
        console.log("After await --> ", email);
        let text = `Hi,   Claim No is ${event.ClaimNo} is assigned to you, for confirming conflict of interest `;

        sendEmail('lmtom.notification@gmail.com', email, 'Alert : Confirm Conflict of Interest', text);
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

function sendEmailWithAttachment(from, email, subject, text,filename, filepath) {

    var mailOptions = {
        from: from,
        to: email,
        subject: subject,
        html: text,
        attachments: [
            {
                filename: 'fileName.xml',
                contenpathtType: filepath
            }]
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






function sanitize(obj) {

    delete obj['$class'];
    if (obj.hasOwnProperty('checkPremium')) {
        delete obj['checkPremium']['$class'];
    }

    if (obj.hasOwnProperty('houseKeeping')) {
        delete obj['houseKeeping']['$class'];
    }
    if (obj.hasOwnProperty('segmnt')) {
        delete obj['segmnt']['$class'];
    }
    if (obj.hasOwnProperty('ClaimSettlementAmount')) {
        delete obj['ClaimSettlementAmount']['$class'];
    }
    return obj;
}

async function generateXML(claimNo) {

    var claimObj = [];
    connection.connect(cardName).then(function () {
          console.log("Fetching  details for  ", claimNo);
          var filePath = "/tmp/".concat(claimNo).concat(".xml");
          fs.stat(filePath, function (err, stats) {
            //console.log(stats);//here we got all information of file in stats variable
         
            if (err) {
                return console.error(err);
            }
         
            fs.unlink(filePath,function(err){
                 if(err) return console.log(err);
                 console.log('file deleted successfully');
            });  
         });


          connection.getAssetRegistry(NS_CLAIM)
                .then(function (registry) {
                      return registry.get(claimNo);
                }).then((claim) => {

                      const bnDef = connection.getBusinessNetwork();
                      var serializer = bnDef.getSerializer();
                      claimObj = serializer.toJSON(claim)

                     var myxml = (js2xmlparser.parse("claim", sanitize(claimObj)));
                      
                     fs.appendFile(filePath, myxml, function (err) {
                        
                      if (err) throw err;
                      console.log('Saved!');
                });
                var text = "Hi, please fiel the attached EBOT xml.";
                sendEmailWithAttachment('lmtom.notification@gmail.com', 'lmtom.notification@gmail.com', 'Claim EBOT file ', text, claimNo.concat(".xml"), filePath);

                });
    });


}