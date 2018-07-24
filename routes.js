/*jshint esversion: 6 */
/*jshint node: true */

"use strict";

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-6';
const connection = new bnc();
var Client = require('node-rest-client').Client;
var restclient = new Client();
const fs = require('fs');

const bnUtil = require('./dlt-connection-util');

const PRTCP_PARTY = '_Party';
const AST_POLICY = 'Policy';
const AST_CLAIM = 'Claim';

const NS = "org.lloyds.market";
const NS_model = "org.lloyds.model";
const NS_PARTY = 'org.lloyds.market._Party';
const NS_CLAIM = 'org.lloyds.market.Claim';
const NS_POLICY = 'org.lloyds.market.Policy';

var jsonObj = [];
var results1;
var results2;
var claim_obj;
var policy_obj;


module.exports = (app) => {

    app.get('/', function (req, res) {
        res.end("Welcome to Lloyds Market DLT services");
    });

    app.get('/login', function (req, res) {

        console.log("********* login");
        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            res.json({
                "status": "Login successfull"
            });
            res.status(200);
        }
    });

    app.get('/Claims', function (req, res) {

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            const cardName_new = getCardName(user);
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
                    console.log("********* Claims", results2);
                    connection.disconnect();

                    for (var i = 0; i < results1.length; i++) {
                        var obj = results1[i];
                        console.log("*********");
                        console.log(obj.PolicyNo.$identifier);
                        var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                        var policy_obj = policyResult[0];
                        console.log(policy_obj.PolicyNo);

                        jsonObj.push({
                            "ClaimNo": obj.ClaimNo,
                            "InsuredCompanyName": policy_obj.InsuredCompanyName,
                            "PolicyNo": policy_obj.PolicyNo,
                            "Day": obj.ClaimCreateDate.toString(),

                            "MovementDate": policy_obj.PolicyEffectiveDate,

                        });
                    }

                    console.log("*************************");
                    for (let i = 0; i < jsonObj.length; i++) {
                        let obj = jsonObj[i];
                        for (var key in obj) {
                            if (key == "Day") {
                                var attrValue = obj[key];
                                var d = new Date(attrValue);
                                jsonObj[i][key] = timeSince(d);
                                console.log(timeSince(d));
                            }
                        }
                    }
                    res.json({
                        jsonObj
                    });
                });

            });
        }

    });

    app.get('/ClaimDetails/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimDetails " + req.params.ClaimNumber);
        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            const cardName_new = getCardName(user);
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, {
                    id: req.params.ClaimNumber
                });
            }).then((results1) => {
                claim_obj = results1[0];
                console.log(claim_obj.PolicyNo.$identifier);
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, {
                        id: claim_obj.PolicyNo.$identifier
                    });
                }).then((results2) => {
                    policy_obj = results2[0];
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
                    console.log("*************************");
                    console.log(jsonObj);
                    res.json(jsonObj);

                });

            });
        }
    });

    app.get('/ClaimInvestigate/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimInvestigate " + req.params.ClaimNumber);

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            const cardName_new = getCardName(user);
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, {
                    id: req.params.ClaimNumber
                });
            }).then((results1) => {
                claim_obj = results1[0];
                console.log(claim_obj.PolicyNo.$identifier);
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, {
                        id: claim_obj.PolicyNo.$identifier
                    });
                }).then((results2) => {
                    policy_obj = results2[0];
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
                    console.log("*************************");
                    console.log(jsonObj);
                    res.json({
                        jsonObj
                    });

                });

            });
        }
    });

    app.get('/ClaimHistory', function (req, res) {

        console.log("********* getClaimHistory");

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            const cardName_new = getCardName(user);
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
                        console.log(obj.PolicyNo.$identifier);
                        var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                        var policy_obj = policyResult[0];
                        console.log(policy_obj.PolicyNo);

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

                    console.log("*************************");
                    res.json({
                        jsonObj
                    });
                });
            });
        }
    });

    app.get('/ClaimHistory/:ClaimNumber', function (req, res) {
        console.log("*********  ClaimInvestigate " + req.params.ClaimNumber);

        console.log("********* getClaimHistory");

        const user = req.headers["user"];
        const password = req.headers["password"];

        if (user === undefined || password === undefined || validateUser(user, password)) {
            res.writeHead(401, 'Access invalid for user', {
                'Content-Type': 'text/plain'
            });
            res.end('Invalid credentials');
        } else {
            console.log(res);
            const cardName_new = getCardName(user);
            return connection.connect(cardName).then(function () {
                var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                return connection.buildQuery(statement);
            }).then((qry) => {
                return connection.query(qry, {
                    id: req.params.ClaimNumber
                });
            }).then((results1) => {
                claim_obj = results1[0];
                console.log(claim_obj.PolicyNo.$identifier);
                connection.disconnect();

                return connection.connect(cardName).then(function () {
                    var statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                    return connection.buildQuery(statement);
                }).then((qry) => {
                    return connection.query(qry, {
                        id: claim_obj.PolicyNo.$identifier
                    });
                }).then((results2) => {
                    policy_obj = results2[0];
                    connection.disconnect();
                    console.log(policy_obj.PolicyNo);


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

                    console.log("*************************");
                    res.json({
                        jsonObj
                    });
                });
            });
        }
    });

    app.post('/Policies/new', (req, res) => {

        const setupdemoTrans = "SetupDemo";
        bnUtil.connect(req, (error) => {

            // Check for error
            if (error) {
                console.log(error);
                process.exit(1);
            }

            // 2. Get the Business Network Definition
            let bnDef = bnUtil.connection.getBusinessNetwork();
            console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);

            console.log(req.body.data.PolicyNo);

            // 3. Get the factory
            let factory = bnDef.getFactory();

            // 4. Create an instance of transaction
            let options = {
                generate: false,
                includeOptionalFields: false
            };

            let PolicyId = req.body.data.PolicyNo;
            let policyResource = factory.newTransaction(NS_model, setupdemoTrans, PolicyId, options);

            // 5. Set up the properties of the transaction object
            policyResource.PolicyNo = PolicyId;
            policyResource.InsuredCompanyName = req.body.data.InsuredCompanyName;
            policyResource.PolicyType = req.body.data.PolicyType;
            policyResource.PolicyDetails1 = req.body.data.PolicyDetails1;
            policyResource.PolicyEffectiveDate = new Date(req.body.data.PolicyEffectiveDate);
            policyResource.PolicyExpiryDate = new Date(req.body.data.PolicyExpiryDate);

            let relationship = factory.newRelationship(NS, PRTCP_PARTY, req.body.data.LeadCarrier);
            policyResource.LeadCarrier = relationship;

            // 6. Submit the transaction
            return bnUtil.connection.submitTransaction(policyResource).then(() => {
                console.log("6. Transaction Submitted/Processed Successfully!!");
                bnUtil.disconnect();

            }).catch((error) => {
                console.log(error);
                bnUtil.disconnect();
            });
        });
    });

    app.put('/Policies/update/:PolicyNo', (req, res) => {

        bnUtil.connect(req, () => {
            let policyRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Policy').then((registry) => {
                console.log('1. Received Registry: ', registry.id);
                policyRegistry = registry;
                return policyRegistry.get(req.params.PolicyNo);
            }).then((policy) => {
                if (!policy) console.log(req.params.PolicyNo + 'Not found');

                policy.PolicyStatus = req.body.name;
                return policyRegistry.update(policy).then(() => {
                    console.log('Updated successfully!!!');
                    res.end("Updated successfully");
                    bnUtil.connection.disconnect();
                });
            }).catch((error) => {
                console.log(error);
                bnUtil.connection.disconnect();
            });
        });
    });

    // Claim conflict
    app.put('/ClaimConflict/:ClaimNo', (req, res) => {
        const claimConflictTrans = "claimConflict";
        bnUtil.connect(req, (error) => {

            // Check for error
            if (error) {
                console.log(error);
                process.exit(1);
            }
            // 2. Get the Business Network Definition
            let bnDef = bnUtil.connection.getBusinessNetwork();
            console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);

            console.log(req.params.ClaimNo);

            // 3. Get the factory
            let factory = bnDef.getFactory();

            // 4. Create an instance of transaction
            let options = {
                generate: false,
                includeOptionalFields: false
            };

            const transaction = factory.newTransaction(NS_model, claimConflictTrans, req.params.ClaimNo, options);
            transaction.claimId = req.params.ClaimNo;
            console.log('mode:' + req.body.data.ClaimMode);

            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry(NS_CLAIM).then((registry) => {
                console.log('Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                console.log("claim:" + claim);

                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                bnUtil.connection.getAssetRegistry(NS_POLICY).then((policyReg) => {
                    console.log('Received Registry: ', policyReg.id);
                    return policyReg.get(claim.PolicyNo.$identifier);
                }).then((policy) => {
                    console.log("Pol:" + policy.LeadCarrier);

                    console.log("Policy num: " + JSON.stringify(claim.PolicyNo.$identifier));

                    if (req.body.data.ClaimMode === 'Approved') {
                        transaction.ClaimMode = "Approved";
                        transaction.owner = policy.LeadCarrier;
                    } else {
                        transaction.owner = claim.Followers1;
                    }

                    return transaction;
                }).then((transaction) => {
                    console.log('TR: ' + transaction);
                    // 6. Submit the transaction
                    return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                    });
                });
            }).catch((error) => {
                console.log(error);
                connection.disconnect();
            });
        });
    });


    //Update the Claim Premium check
    app.put('/ClaimPremiumCheck/update/:ClaimNo', (req, res) => {

        const claimPremCheck = "claimPremCheck";
        bnUtil.connect(req, (error) => {

            // Check for error
            if (error) {
                console.log(error);
                process.exit(1);
            }

            // 2. Get the Business Network Definition
            let bnDef = bnUtil.connection.getBusinessNetwork();
            console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);

            console.log(req.params.ClaimNo);

            // 3. Get the factory
            let factory = bnDef.getFactory();

            // 4. Create an instance of transaction
            let options = {
                generate: false,
                includeOptionalFields: false
            };

            const transaction = factory.newTransaction(NS_model, claimPremCheck, req.params.ClaimNo, options);
            transaction.claimId = req.params.ClaimNo;

            console.log('premiumBeenPaiByPolHolder:' + req.body.data.premiumBeenPaiByPolHolder);
            const PremiumCheck = factory.newConcept(NS, '_Premium');
            PremiumCheck.premiumBeenPaiByPolHolder = req.body.data.premiumBeenPaiByPolHolder;
            PremiumCheck.reinstatementApplicable = req.body.data.reinstatementApplicable;
            PremiumCheck.reinstatementPaidByPolHolder = req.body.data.reinstatementPaidByPolHolder;
            transaction.premium = PremiumCheck;

            // 6. Submit the transaction
            return bnUtil.connection.submitTransaction(transaction).then(() => {
                console.log("6. Transaction Submitted/Processed Successfully!!");
                bnUtil.disconnect();
            }).catch((error) => {
                console.log(error);
                bnUtil.connection.disconnect();
            });
        });
    });

    // Get the Premium check details
    app.get('/ClaimPremiumCheck/:ClaimNo', (req, res) => {
        bnUtil.connect(req, () => {
            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('1. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                console.log("*************************");
                console.log(claim);

                const bnDef = bnUtil.connection.getBusinessNetwork();

                //to get the JSON object in get params
                var serializer = bnDef.getSerializer();

                jsonObj.push({
                    "ClaimNo": claim.ClaimNo,
                    "checkPremium": serializer.toJSON(claim.checkPremium)
                });
                console.log("*************************");
                console.log(jsonObj);
                res.json({
                    jsonObj
                });
            });
        });
    });

    // Update segment information
    app.put('/ClaimSegment/update/:ClaimNo', (req, res) => {
        bnUtil.connect(req, () => {
            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('ClaimSegment Started \n. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                const bnDef = bnUtil.connection.getBusinessNetwork();
                const factory = bnDef.getFactory();

                let Segmentation = factory.newConcept('org.lloyds.market', 'Segmentation');

                let relationship = factory.newRelationship('org.lloyds.market', 'Owner', req.body.user);

                Segmentation.name = relationship;
                Segmentation.role = req.body.role;
                Segmentation.office = req.body.office;
                Segmentation.segDate = new Date();

                claim.segmnt = Segmentation;

                return claimRegistry.update(claim).then(() => {
                    console.log('Updated successfully!!!');
                    res.end("Updated successfully");
                    bnUtil.connection.disconnect();
                });
            }).catch((error) => {
                console.log(error);
                bnUtil.connection.disconnect();
            });
        });
    });

    //Get segment details
    app.get('/ClaimSegment/:ClaimNo', (req, res) => {
        bnUtil.connect(req, () => {
            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('1. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                console.log("*************************");
                console.log(claim);

                const bnDef = bnUtil.connection.getBusinessNetwork();

                //to get the JSON object in get params
                var serializer = bnDef.getSerializer();

                jsonObj.push({
                    "ClaimNo": claim.ClaimNo,
                    "checkPremium": serializer.toJSON(claim.segmnt)
                });
                console.log("*************************");
                console.log(jsonObj);
                res.json({
                    jsonObj
                });
            });
        });
    });

    // Get Housekeeping Check
    app.get('/HouseKeepCheck/:ClaimNo', (req, res) => {
        bnUtil.connect(req, () => {
            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('1. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                console.log("*************************");
                console.log(claim);

                const bnDef = bnUtil.connection.getBusinessNetwork();

                //to get the JSON object in get params
                var serializer = bnDef.getSerializer();

                jsonObj.push({
                    "ClaimNo": claim.ClaimNo,
                    "checkPremium": serializer.toJSON(claim.houseKeeping)
                });
                console.log("*************************");
                console.log(jsonObj);
                res.json({
                    jsonObj
                });
            });
        });
    });

    // Update Housekeeping check
    app.put('/HouseKeepCheck/update/:ClaimNo', (req, res) => {
        bnUtil.connect(req, () => {
            let claimRegistry = {};
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('ClaimSegment Started \n. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                console.log(req.body);
                const bnDef = bnUtil.connection.getBusinessNetwork();
                const factory = bnDef.getFactory();

                let houseKeeping = factory.newConcept('org.lloyds.market', 'houseKeeping');


                houseKeeping.premiumBeenPaidByPolHolder = req.body.premiumBeenPaidByPolHolder;
                houseKeeping.reinstatementPremiumPaid = req.body.reinstatementPremiumPaid;
                houseKeeping.anyFraud = req.body.anyFraud;

                claim.houseKeeping = houseKeeping;

                return claimRegistry.update(claim).then(() => {
                    console.log('Updated successfully!!!');
                    res.end("Updated successfully");
                    bnUtil.connection.disconnect();
                });
            }).catch((error) => {
                console.log(error);
                bnUtil.connection.disconnect();
            });
        });
    });
};

function validateUser(user, password) {
    switch (user) {
        case "Isabelle":
            if (password === "1234") {
                return false;
            } else {
                return true;
            }
            break;
        case "GaingKim":
            if (password === "1234") {
                return false;
            } else {
                return true;
            }
            break;
        default:
            return true;
    }
}

function getCardName(user) {
    switch (user) {
        case "Isabelle":
            return 'Isabelle@lloyds-project-6';

        case "GaingKim":
            return 'GaingKim@lloyds-project-6';

        default:
            return '';
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