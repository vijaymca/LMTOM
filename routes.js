'use strict';

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-6';
const connection = new bnc();
var Client = require('node-rest-client').Client;
var restclient = new Client();
const fs = require('fs');

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.end("Welcome to Lloyds Market DLT services");
    });

    app.get('/login', function (req, res) {

        console.log("********* login")
        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            res.json({ "status": "Login successfull" });
            res.status(200);
        }
    });

    app.get('/Claims', function (req, res) {
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* Claims")


        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user)
            return connection.connect(cardName_new).then(function () {
                var statement = 'SELECT org.lloyds.market.Claim';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry);
            }).then((results1) => {
                connection.disconnect();

                return connection.connect(cardName_new).then(function () {
                    var statement = 'SELECT org.lloyds.market.Policy ';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry);
                }).then((results2) => {
                    console.log("********* Claims", results2)
                    connection.disconnect();

                    for (var i = 0; i < results1.length; i++) {
                        var obj = results1[i];
                        console.log("*********");
                        console.log(obj.PolicyNo.$identifier)
                        var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                        var policy_obj = policyResult[0]
                        console.log(policy_obj.PolicyNo)
                        {
                            jsonObj.push({
                                "ClaimNo": obj.ClaimNo,
                                "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                "PolicyNo": policy_obj.PolicyNo,
                                "Day": obj.ClaimCreateDate.toString(),

                                "MovementDate": policy_obj.PolicyEffectiveDate,

                            });
                        }
                    }

                    console.log("*************************")
                    for (var i = 0; i < jsonObj.length; i++) {
                        var obj = jsonObj[i];
                        for (var key in obj) {
                            if (key == "Day") {
                                var attrValue = obj[key];
                                var d = new Date(attrValue);
                                jsonObj[i][key] = timeSince(d)
                                console.log(timeSince(d))
                            }
                        }
                    }
                    res.json({ jsonObj });
                });

            });
        }
    });

    app.get('/ClaimDetails/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimDetails " + req.params.ClaimNumber);
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;


        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user)
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, { id: req.params.ClaimNumber });
            }).then((results1) => {
                claim_obj = results1[0]
                console.log(claim_obj.PolicyNo.$identifier)
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, { id: claim_obj.PolicyNo.$identifier });
                }).then((results2) => {
                    policy_obj = results2[0]
                    connection.disconnect();

                    jsonObj.push({
                        "ClaimNo": claim_obj.ClaimNo,
                        "PolicyNo": claim_obj.PolicyNo.$identifier,
                        "InsuredCompanyName": policy_obj.InsuredCompanyName,


                        "PolicyType": policy_obj.PolicyType,
                        "PolicyEffectiveDate": policy_obj.PolicyEffectiveDate,
                        "PolicyExpiryDate": policy_obj.PolicyExpiryDate,
                        "ClaimDateofLoss": claim_obj.ClaimDateofLoss,
                        "ClaimActionRequired": claim_obj.ClaimActionRequired,

                    });
                    console.log("*************************")
                    console.log(jsonObj)
                    res.json({ jsonObj });

                });

            });
        }
    });


    app.get('/ClaimInvestigate/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimInvestigate " + req.params.ClaimNumber);
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;


        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user)
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, { id: req.params.ClaimNumber });
            }).then((results1) => {
                claim_obj = results1[0]
                console.log(claim_obj.PolicyNo.$identifier)
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, { id: claim_obj.PolicyNo.$identifier });
                }).then((results2) => {
                    policy_obj = results2[0]
                    connection.disconnect();

                    jsonObj.push({
                        "ClaimNo": claim_obj.ClaimNo,
                        "PolicyNo": claim_obj.PolicyNo.$identifier,
                        "InsuredCompanyName": policy_obj.InsuredCompanyName,


                        "PolicyType": policy_obj.PolicyType,
                        "PolicyEffectiveDate": policy_obj.PolicyEffectiveDate,
                        "PolicyExpiryDate": policy_obj.PolicyExpiryDate,
                        "ClaimDateofLoss": claim_obj.ClaimDateofLoss,
                        "ClaimActionRequired": claim_obj.ClaimActionRequired,

                        "ClaimDetails1": claim_obj.ClaimDetails1,
                        "ClaimDetails2": claim_obj.ClaimDetails2,
                        "ClaimNotes": claim_obj.ClaimNotes,
                        "PolicyDetails1": policy_obj.PolicyDetails1,

                    });
                    console.log("*************************")
                    console.log(jsonObj)
                    res.json({ jsonObj });

                });

            });
        }
    });


    app.get('/ClaimHistory', function (req, res) {
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* getClaimHistory")

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user)
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT org.lloyds.market.Claim';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry);
            }).then((results1) => {
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT org.lloyds.market.Policy ';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry);
                }).then((results2) => {
                    connection.disconnect();

                    for (var i = 0; i < results1.length; i++) {
                        var obj = results1[i];
                        console.log("*********");
                        console.log(obj.PolicyNo.$identifier)
                        var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                        var policy_obj = policyResult[0]
                        console.log(policy_obj.PolicyNo)
                        {
                            jsonObj.push({
                                "PolicyNo": policy_obj.PolicyNo,
                                "InsuredCompanyName": policy_obj.InsuredCompanyName,

                                "PolicyType": policy_obj.PolicyType,
                                "PolicyEffectiveDate": policy_obj.PolicyEffectiveDate,
                                "PolicyExpiryDate": policy_obj.PolicyExpiryDate,

                                "ClaimPremiumStatus": obj.ClaimPremiumStatus,
                                "ClaimActionRequired": obj.ClaimActionRequired,
                                "ClaimUpdateDate": obj.ClaimUpdateDate,
                                "ClaimMode": obj.ClaimMode,
                                "ClaimNo": obj.ClaimNo,
                            });
                        }
                    }

                    console.log("*************************")
                    res.json({ jsonObj });
                });
            });
        }
    });


    app.get('/ClaimHistory/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimInvestigate " + req.params.ClaimNumber);
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* getClaimHistory")

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user)
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, { id: req.params.ClaimNumber });
            }).then((results1) => {
                claim_obj = results1[0]
                console.log(claim_obj.PolicyNo.$identifier)
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, { id: claim_obj.PolicyNo.$identifier });
                }).then((results2) => {
                    policy_obj = results2[0]
                    connection.disconnect();
                    console.log(policy_obj.PolicyNo)
                    {
                        jsonObj.push({
                            "PolicyNo": policy_obj.PolicyNo,
                            "InsuredCompanyName": policy_obj.InsuredCompanyName,

                            "PolicyType": policy_obj.PolicyType,
                            "PolicyEffectiveDate": policy_obj.PolicyEffectiveDate,
                            "PolicyExpiryDate": policy_obj.PolicyExpiryDate,

                            "ClaimPremiumStatus": claim_obj.ClaimPremiumStatus,
                            "ClaimActionRequired": claim_obj.ClaimActionRequired,
                            "ClaimUpdateDate": claim_obj.ClaimUpdateDate,
                            "ClaimMode": claim_obj.ClaimMode,
                            "ClaimNo": claim_obj.ClaimNo,
                        });
                    }


                    console.log("*************************")
                    res.json({ jsonObj });
                });
            });
        }
    });


    app.post('/Policies', (req, res) => {
        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* Claims")

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            console.log(res);
            const cardName_new = getCardName(user);
            connection.connect(cardName_new).then(function () {

                return connection.getAssetRegistry('org.lloyds.market.Policy').then((registry) => {
                    console.log('1. Received Registry: ', registry.id);

                    // Utility method for adding the Policies
                    let policies = [];
                    const bnDef = connection.getBusinessNetwork();
                    const factory = bnDef.getFactory();

                    // Instance#2 
                    let policyResource = factory.newResource('org.lloyds.market', 'Policy', 'CCR Y0001PR0027888');
                    // You may use direct assignment instead of using the setPropertyValue()
                    let followers = ["Dakota (DKT 7809)", "Bleachers Re (BRE 3290)", "Towers Inc (TWR 2244)"];
                    policyResource.InsuredCompanyName = 'James Bowling Estates2';
                    policyResource.PolicyType = 'CommercialProp';
                    policyResource.PolicyDetails1 = 'ATL...2222';
                    policyResource.LeadCarrier = 'Fortitude (FRT 2100)2';
                    policyResource.PlacingBroker = 'PlacingBroker', 'WideWorld Broking limited-222';
                    policyResource.ClaimsBroker = 'Lloyds Claim Broker-22';
                    policyResource.OverseasBroker = 'Lloyds Claim Broker-22';
                    policyResource.Followers = followers;
                    policyResource.PolicyStatus = "Approved2";

                    policyResource.PolicyEffectiveDate = new Date('2018-11-15T21:44Z');
                    policyResource.PolicyExpiryDate = new Date('2019-11-15T21:44Z');

                    // Push instance to  the aircrafts array
                    policies.push(policyResource);

                    // 4. Add the Aircraft resource to the registry
                    return registry.addAll(policies).then(() => {
                        console.log('Added the Resources successfully!!!');
                        res.end("Added Resource successfully");
                        connection.disconnect();
                    });
                }).catch((error) => {
                    console.log(error);
                    connection.disconnect();
                });
            });
        }

        // sample code.
        /*

        const course = {
            id: courses.length + 1,
            name: req.body.name
        };

        courses.push(course);
        res.send(courses);
        */
    });


    app.put('/Policies/:PolicyNo', (req, res) => {

        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* Claims");

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            // console.log(res);
            console.log(req.body.name);
            const cardName_new = getCardName(user);
            connection.connect(cardName_new).then(function () {
                let policyRegistry = {}
                return connection.getAssetRegistry('org.lloyds.market.Policy').then((registry) => {
                    console.log('1. Received Registry: ', registry.id);
                    policyRegistry = registry;
                    return policyRegistry.get(req.params.PolicyNo);
                }).then((policy) => {
                    if (!policy) console.log(req.params.PolicyNo + 'Not found');

                    policy.PolicyStatus = req.body.name;
                    return policyRegistry.update(policy).then(() => {
                        console.log('Updated successfully!!!');
                        res.end("Updated successfully");
                        connection.disconnect();
                    });
                }).catch((error) => {
                    console.log(error);
                    connection.disconnect();
                });
            });
        }
    });


    app.put('/ClaimConflict/:ClaimNo', (req, res) => {

        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        console.log("********* Claims");

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
            res.end('Invalid credentials');
        }
        else {
            // console.log(res);
            console.log(req.body.ClaimMode);
            const cardName_new = getCardName(user);
            connection.connect(cardName_new).then(function () {

                let claimRegistry = {}
                return connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                    console.log('1. Received Registry: ', registry.id);
                    claimRegistry = registry;
                    return claimRegistry.get(req.params.ClaimNo);
                }).then((claim) => {
                    if (!claim) console.log(req.params.ClaimNo + 'Not found');

                    if (req.body.ClaimMode === 'Approved')
                        claim.ClaimMode = req.body.ClaimMode;


                    const bnDef = connection.getBusinessNetwork();
                    const factory = bnDef.getFactory();

                    let relationship = factory.newRelationship('org.lloyds.market', 'Owner', 'GaingKim');
                    claim.owner = relationship;

                    return claimRegistry.update(claim).then(() => {
                        console.log('Updated successfully!!!');
                        res.end("Updated successfully");
                        connection.disconnect();
                    });
                }).catch((error) => {
                    console.log(error);
                    connection.disconnect();
                });

            });
        }

    });
};

function validateUser(user, password) {
    switch (user) {
        case "Isabelle":
            if (password === "1234") {
                return false
            }
            else {
                return true
            }
            break;
        case "GaingKim":
            if (password === "1234") {
                return false
            }
            else {
                return true
            }
            break;
        default:
            return true
    }
}


function getCardName(user) {
    switch (user) {
        case "Isabelle":
            return 'Isabelle@lloyds-project-6'
            break;
        case "GaingKim":
            return 'GaingKim@lloyds-project-6'
            break;
        default:
            return ''
    }
}


function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function addPolicies(registry) {

}