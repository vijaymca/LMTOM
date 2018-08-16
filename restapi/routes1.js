/*jshint esversion: 6 */
/*jshint node: true */

"use strict";

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-11';
const connection = new bnc();
const fs = require('fs');
var js2xmlparser = require("js2xmlparser");
var colors = require('colors/safe');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
// increase the limit
myEmitter.setMaxListeners(100);

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

      app.get('/login', async (req, res, next) => {
            var jsonObj = [];
            console.log("1. ********* login")
            const user = req.headers["user"];
            const password = req.headers["password"];
            console.log("2. ********* login1", user);
            if (user === undefined || password === undefined || user === "" || password === "") { // || validateUser(user, password)) {
                  res.writeHead(401, 'Access invalid for user', {
                        'Content-Type': 'text/plain'
                  });

                  res.end('Invalid credentials');
            } else {
                  console.log("3. ********* login2");
                  const party = await fetchDetails(user, password);
                  console.log("3. ********* login2");
                  res.json(party);

            }
      });

      async function fetchDetails(user, password) {
            const details = await getUserDetails(user, password);
            console.log("After await --> ", details);
            connection.disconnect();
            return details;
      }


      async function getUserDetails(party, password) {
            var jsonObj = [];
            return new Promise((resolve, reject) => {
                  connection.connect(cardName).then(function () {
                        console.log("Fetching uset details for user ", party);

                        connection.getParticipantRegistry('org.lloyds.market._Party')
                              .then(function (playerRegistry) {
                                    return playerRegistry.exists(party);
                              })
                              .then(function (exists) {
                                    if (exists) {
                                          console.log("user exists");
                                          return connection.getParticipantRegistry('org.lloyds.market._Party')
                                                .then(function (assetRegistry) {
                                                      return assetRegistry.get(party);
                                                })
                                                .then(function (user) {
                                                      if (password == user.Password) {
                                                            jsonObj.push({
                                                                  "UserName": user.UserName,
                                                                  "Name": user.Name,
                                                                  "Role": user.Role,
                                                                  "CompanyName": user.CompanyName,
                                                                  "Email": user.Email,
                                                            });
                                                            resolve(jsonObj);
                                                      } else {
                                                            jsonObj.push({
                                                                  "Error": "Incorrect Password",
                                                            });
                                                            resolve(jsonObj);
                                                      }
                                                });

                                    } else {
                                          //console.log("User does not exists");
                                          jsonObj.push({
                                                "Error": "Invalid User",
                                          });
                                          console.log("User does not exists", jsonObj);
                                          resolve(jsonObj);
                                    }
                              });
                  });
            });

      }

      app.get('/Claims', function (req, res) {
            var jsonObj = [];

            const user = req.headers["user"];
            const password = req.headers["password"];

            if (user === undefined) {
                  res.writeHead(401, 'Access invalid for user', {
                        'Content-Type': 'text/plain'
                  });
                  res.end('Invalid credentials');
            } else {
                  //console.log(res);
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
                                          "MovementDate": policy_obj.ContractPeriod.StartDateTime
                                    });
                              }

                              console.log("*************************");
                              for (let i = 0; i < jsonObj.length; i++) {
                                    let obj = jsonObj[i];
                                    for (var key in obj) {
                                          if (key == "Day") {
                                                var attrValue = obj[key];
                                                var d = new Date(attrValue);
                                                jsonObj[i][key] = timeDifference(d);
                                                //console.log(timeDifference(d));
                                          }
                                    }
                              }
                              res.json({
                                    jsonObj
                              });
                        });

                  }).catch((error) => {
                        var jsonObj = [];
                        console.log(error);

                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        res.json({
                              jsonObj
                        });
                  });
            }

      });

      app.post('/Claim/new', (req, res) => {
            var jsonObj = [];
            bnUtil.connect(req, res, () => {
                  console.log("1. Claim/new");
                  let PolicyRegistry = {};
                  return bnUtil.connection.getAssetRegistry('org.lloyds.market.Policy').then((registry) => {
                        console.log('1. Received Registry: ', registry.id);
                        PolicyRegistry = registry;
                        return PolicyRegistry.get(req.body.PolicyNo);
                  }).then((Policy) => {
                        if (!Policy) console.log(req.body.PolicyNo + 'Not found');

                        let bnDef = bnUtil.connection.getBusinessNetwork();
                        console.log("2. Received Definition from Runtime: ", bnDef.getName(), "  ", bnDef.getVersion());
                        let factory = bnDef.getFactory();
                        let transaction = factory.newTransaction('org.lloyds.model', 'CreateClaim');

                        transaction.setPropertyValue('ClaimNo', req.body.ClaimNo);
                        transaction.setPropertyValue('ClaimCreatedBy', req.body.ClaimCreatedBy);

                        transaction.setPropertyValue('ClaimDetails1', req.body.ClaimDetails1);
                        transaction.setPropertyValue('ClaimDetails2', req.body.ClaimDetails2);

                        transaction.setPropertyValue('ClaimCreateDate', new Date(req.body.ClaimCreateDate));
                        transaction.setPropertyValue('ClaimDateofLoss', new Date(req.body.ClaimDateofLoss));
                        transaction.setPropertyValue('ClaimTargetDate', new Date(req.body.ClaimTargetDate));
                        transaction.setPropertyValue('ClaimEstimateLoss', req.body.ClaimEstimateLoss);
                        transaction.setPropertyValue('PolicyNo', req.body.PolicyNo);
                        transaction.setPropertyValue('owner', Policy.LeadCarrier.$identifier.toString());
                        transaction.setPropertyValue('LeadCarrier', Policy.LeadCarrier.$identifier.toString());

                        transaction.setPropertyValue('PlacingBroker', Policy.PlacingBroker.$identifier.toString());
                        transaction.setPropertyValue('ClaimsBroker', Policy.ClaimsBroker.$identifier.toString());
                        transaction.setPropertyValue('OverseasBroker', Policy.OverseasBroker.$identifier.toString());
                        transaction.setPropertyValue('PolicyOwner', Policy.Insured.$identifier.toString());
                        transaction.setPropertyValue('Followers1', Policy.Followers1.$identifier.toString());
                        transaction.setPropertyValue('Followers2', Policy.Followers2.$identifier.toString());
                        transaction.setPropertyValue('Followers3', Policy.Followers3.$identifier.toString());
                        transaction.setPropertyValue('Followers4', Policy.Followers4.$identifier.toString());

                        // 6. Submit the transaction
                        return bnUtil.connection.submitTransaction(transaction).then(() => {
                              console.log("3. Transaction Submitted/Processed Successfully!!");
                              bnUtil.disconnect();
                              jsonObj.push({
                                    "status": "Transaction Submitted",
                              });
                              res.json({
                                    jsonObj
                              });

                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'Exception occured,please check query and try again.'
                              });
                              res.json({
                                    jsonObj
                              });
                              bnUtil.disconnect();
                        });
                  });
            });
      });

      app.get('/ClaimDetails/:ClaimMode', function (req, res) {
            var jsonObj = [];
            var results1;
            var results2;
            var claim_obj;
            var policy_obj;
            console.log("*********  ClaimDetails " + req.params.ClaimMode);


            const user = req.headers["user"];
            const password = req.headers["password"];

            if (user === undefined) {
                  res.writeHead(401, 'Access invalid for user', {
                        'Content-Type': 'text/plain'
                  });
                  res.end('Invalid credentials');
            } else {
                  console.log(res);
                  const cardName_new = getCardName(user)
                  return connection.connect(cardName_new).then(function () {
                        var statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimMode == _$id)';
                        return connection.buildQuery(statement);
                  }).then((qry) => {
                        return connection.query(qry, {
                              id: req.params.ClaimMode
                        });
                  }).then((results1) => {
                        console.log("********* Claims", results1);
                        connection.disconnect();

                        return connection.connect(cardName_new).then(function () {
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
                                    var policy_obj = policyResult[0]
                                    console.log(policy_obj.PolicyNo);
                                    jsonObj.push({
                                          "ClaimNo": obj.ClaimNo,
                                          "PolicyNo": policy_obj.PolicyNo,
                                          "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                          "PolicyType": policy_obj.PolicyType,
                                          "PolicyEffectiveDate": policy_obj.ContractPeriod.StartDateTime,
                                          "PolicyExpiryDate": policy_obj.ContractPeriod.EndDateTime,
                                          "ClaimPremiumStatus": obj.ClaimPremiumStatus,
                                          "PolicyStatus": policy_obj.PolicyStatus,
                                          "ClaimActionRequired": obj.ClaimActionRequired,
                                          "ClaimDateofLoss": obj.ClaimDateofLoss
                                    });
                              }

                              console.log("*************************" + jsonObj);
                              jsonObj = jsonObj.map(function (e) {
                                    return e;
                              }).sort()[0];

                              console.log(jsonObj);

                              for (var i = 0; i < jsonObj.length; i++) {
                                    var obj = jsonObj[i];
                                    for (var key in obj) {
                                          if (key == "Day") {
                                                var attrValue = obj[key];
                                                var d = new Date(attrValue);
                                                jsonObj[i][key] = timeDifference(d);
                                                console.log(timeDifference(d));
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

      app.get('/ClaimInvestigate/:ClaimNumber', (req, res) => {

            var jsonObj = [];
            var results1;
            var results2;
            var claim_obj;
            var policy_obj;
            bnUtil.connect(req, res, () => {

                  return bnUtil.connection.getAssetRegistry(NS_CLAIM)
                        .then(function (registry) {
                              return registry.get(req.params.ClaimNumber);
                        }).then((results1) => {
                              var obj = results1;
                              return bnUtil.connection.getAssetRegistry(NS_POLICY)
                                    .then(function (registry) {
                                          return registry.get(obj.PolicyNo.$identifier);
                                    }).then((results2) => {
                                          var policy_obj = results2;
                                          console.log(policy_obj.PolicyNo);
                                          jsonObj.push({
                                                "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                                "ClaimNo": obj.ClaimNo,
                                                "PolicyNo": policy_obj.PolicyNo,
                                                "PolicyEffectiveDate": policy_obj.ContractPeriod.StartDateTime,
                                                "PolicyExpiryDate": policy_obj.ContractPeriod.EndDateTime,
                                                "ClaimDateofLoss": obj.ClaimDateofLoss
                                          });

                                          console.log("*************************")
                                          res.json({
                                                jsonObj
                                          });
                                    });
                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'Exception occured,please check query and try again.'
                              });
                              bnUtil.disconnect()
                              res.json({
                                    jsonObj
                              });
                        });
            });
      });


      app.get('/ClaimHistory', function (req, res) {
            var jsonObj = [];

            console.log("********* ClaimHistory");

            const user = req.headers["user"];
            const password = req.headers["password"];

            if (user === undefined) {
                  res.writeHead(401, 'Access invalid for user', {
                        'Content-Type': 'text/plain'
                  });
                  jsonObj.push({
                        "status": 'user header is undefined'
                  });
                  res.json({
                        jsonObj
                  });
            } else {
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
                                          "PolicyEffectiveDate": policy_obj.ContractPeriod.StartDateTime,
                                          "PolicyExpiryDate": policy_obj.ContractPeriod.EndDateTime,

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
                  }).catch((error) => {
                        var jsonObj = [];
                        console.log(error);

                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        res.json({
                              jsonObj
                        });
                  });
            }
      });


      app.get('/ClaimHistory/:ClaimNumber', function (req, res) {
            var jsonObj = [];
            console.log("*********  ClaimInvestigate " + req.params.ClaimNumber);

            console.log("********* getClaimHistory");

            const user = req.headers["user"];
            const password = req.headers["password"];

            if (user === undefined) {
                  res.writeHead(401, 'Access invalid for user', {
                        'Content-Type': 'text/plain'
                  });
                  jsonObj.push({
                        "status": 'user header is undefined'
                  });
                  res.json({
                        jsonObj
                  });
            } else {
                  //console.log(res);
                  const cardName_new = getCardName(user);
                  return connection.connect(cardName_new).then(function () {
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

                        return connection.connect(cardName_new).then(function () {
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
                                    "PolicyEffectiveDate": policy_obj.ContractPeriod.StartDateTime,
                                    "PolicyExpiryDate": policy_obj.ContractPeriod.EndDateTime,

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
                  }).catch((error) => {
                        console.log(error);
                        var jsonObj = [];

                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        //res.writeHead(401, 'Access invalid for user', { 'Content-Type': 'text/plain' });
                        res.json({
                              jsonObj
                        });
                  });
            }
      });

      function getPolicyRep(req, res) {
            return new Promise((resolve, reject) => {
                let jsonObj = [];
                bnUtil.connect(req, res, (error) => {
                    const bnDef = bnUtil.connection.getBusinessNetwork();
                    var serializer = bnDef.getSerializer();
                    let policyRegistry = {};
                    return bnUtil.connection.getAssetRegistry(NS_POLICY).then(async (registry) => {
                        console.log('1. Received Registry: ', registry.id);
                        policyRegistry = registry;
    
                        const exists = await policyRegistry.exists(req.params.PolicyNo);
    
                        if (exists) {
                            return policyRegistry.get(req.params.PolicyNo);
                        }
    
                    }).then(async (policy) => {
    
                        const obj = serializer.toJSON(policy);
    
                        // console.log(`INSURED:${JSON.stringify(obj.premium)}`);
    
                        let polLayerinfo = {
                            "layer": obj.insuranceAmount.layer,
                            "currency": obj.insuranceAmount.currency,
                            "limit": {
                                "for": obj.insuranceAmount.limitFrom,
                                "per": obj.insuranceAmount.limitTo
                            },
                            "deductable": obj.insuranceAmount.deductable,
                            "PD": obj.insuranceAmount.property_damage,
                            "BI": obj.insuranceAmount.busi_interupt,
                            "coverage": obj.insuranceAmount.coverage,
                            "brokarage": obj.insuranceAmount.brokerage,
                            "premium": obj.insuranceAmount.premiumTot,
                            "riskCode": obj.insuranceAmount.riskCode,
                            "order": obj.insuranceAmount.order
                        };
    
                        const insuredAddress = await getPartyAdress(req, res, policy.Insured.getIdentifier());
                        const BrokerPlacingAddress = await getPartyAdress(req, res, policy.PlacingBroker.getIdentifier());
                        const BrokerOverSeasAddress = await getPartyAdress(req, res, policy.OverseasBroker.getIdentifier());
    
                        jsonObj.push({
                            "PolicyNo": policy.PolicyNo,
                            "PolicyType": obj.PolicyType,
                            "InsuredCompanyName": obj.InsuredCompanyName,
                            "InsuredMailingAddress": insuredAddress,
                            "BrokerPlacing": BrokerPlacingAddress,
                            "BrokerOverSeas": BrokerOverSeasAddress,
                            "TotalSumInsured": obj.insuranceAmount,
                            "FinancialOverview": obj.premium,
                            "polLayerinfo": polLayerinfo,
                            "ContractPeriod": obj.ContractPeriod,
                            "Followers": obj.followers,
                            "Sublimits": obj.sublimits,
                            "CarrierInfo": obj.carrierInfo
                        });
    
                        // res.json({
                        //     jsonObj
                        // });
                        resolve(jsonObj);
                    }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                            "status": 'exception occured'
                        });
                        bnUtil.connection.disconnect();
                        res.json({
                            jsonObj
                        });
                    });
                });
            });
        }

      /** GET POLICY INFORMATION
       * 
       */
      app.get('/getPolicy/:PolicyNo', async (req, res) => {
            console.log(colors.custom('**Call getPolicy**'));
            let jsonObj = await getPolicyRep(req, res);
            res.json({
                  jsonObj
            });
      });

      /** CREATE XML FILE
       * 
       */
      app.get('/createXML/:PolicyNo', async (req, res) => {

            console.log(colors.custom('**Call getPolicy for XML**'));

            let polObj = await getPolicyRep(req, res);

            // res.json({
            //     polObj
            // });
            let jsonObj = [];
            jsonObj.push({
                  "status": "Transaction Submitted",
            });

            res.json({
                  jsonObj
            });

            var filePath = "/tmp/".concat(req.params.PolicyNo).concat(".xml");

            fs.stat(filePath, function (err, stats) {
                  //console.log(stats);//here we got all information of file in stats variable

                  if (err) {
                        return console.error(err);
                  }

                  fs.unlink(filePath, function (err) {
                        if (err) return console.log(err);
                        console.log(colors.help('file deleted successfully'));
                  });
            });

            //console.log(colors.data(polObj[0]));

            let pObj = sanitize(polObj[0]);
            console.log(colors.data(pObj));

            var myxml = (js2xmlparser.parse("Policy", pObj));
            fs.appendFile(filePath, myxml, function (err) {
                  if (err) throw err;
                  console.log(colors.silly('Saved!'));
            });
      });

      /** POST -> NEW POLICY
       * 
       */
      app.post('/Policies/new', (req, res) => {
            var jsonObj = [];

            const policyNew = "policyNew";
            bnUtil.connect(req, res, (error) => {

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
                  let policyResource = factory.newTransaction(NS_model, policyNew, PolicyId, options);

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
                        bnUtil.connection.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });

                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "error": error.toString()
                        });
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      /** PUT -> UPDATE POLICY
       * 
       */
      app.put('/Policies/update/:PolicyNo', (req, res) => {
            var jsonObj = [];
            const trPolicy = "updatePolicy";
            bnUtil.connect(req, res, async (error) => {
    
                if (error) {
                    console.log(error);
                    process.exit(1);
                }
    
                // 2. Get the Business Network Definition
                let bnDef = bnUtil.connection.getBusinessNetwork();
                console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);
    
                console.log(req.params.PolicyNo);
    
                const currentUserRole = await getRole(req, res);
    
                // 3. Get the factory
                let factory = bnDef.getFactory();
    
                // 4. Create an instance of transaction
                let options = {
                    generate: false,
                    includeOptionalFields: false
                };
    
                var serializer = bnDef.getSerializer();
    
                let PolicyId = req.params.PolicyNo;
                var policyTraxn = factory.newTransaction(NS_model, trPolicy, PolicyId, options);
    
                const policyRegistry = await bnUtil.connection.getAssetRegistry('org.lloyds.market.Policy');
    
                const policy = await policyRegistry.get(PolicyId);
    
                // 5. Set up the properties of the transaction object
                policyTraxn.PolicyNo = PolicyId;
    
                if (currentUserRole === "Placing Broker" || currentUserRole === "Claims Broker") {
                    console.log(req.body.data.premium);
    
                    policyTraxn.Role = "broker";
                    policyTraxn.premium = [];
                    for (let i in req.body.data.premium) {
                        var premConcept = policy.premium[i];
                        premConcept.PremiumAmount = req.body.data.premium[i].premiumAmount;
                        premConcept.placeBrokerPer = req.body.data.premium[i].placeBrokerPer;
                        let placbroComm = req.body.data.premium[i].placeBrokerPer * req.body.data.premium[i].premiumAmount;
                        premConcept.placeBrokerComm = placbroComm;
                        premConcept.overseasBrokerPer = req.body.data.premium[i].overseasBrokerPer;
                        let oversComm = req.body.data.premium[i].overseasBrokerPer * req.body.data.premium[i].premiumAmount;
                        premConcept.overseasBroComm = oversComm;
                        console.log(colors.prompt(serializer.toJSON(premConcept)));
                        policyTraxn.premium.push(premConcept);
                    }
    
                    policyTraxn.followes = [];
                    console.log(req.body.data.followes);
                    for (let i in req.body.data.followes) {
                        var followConcept = policy.followers[i];
                        followConcept.index = i;
                        followConcept.CompanyName = req.body.data.followes[i].CompanyName;
                        followConcept.written = req.body.data.followes[i].written;
                        followConcept.signed = req.body.data.followes[i].signed;
                        followConcept.premium = req.body.data.followes[i].signed * req.body.data.details.premiumTot;
                        policyTraxn.followes.push(followConcept);
                    }
    
                    var insDetlsConcept = policy.insuranceAmount;
                    insDetlsConcept.order = req.body.data.details.order;
                    insDetlsConcept.premiumTot = req.body.data.details.premiumTot;
                    insDetlsConcept.premiumInUSD = req.body.data.details.premiumTot * 1.28;
                    policyTraxn.insuranceDetails = insDetlsConcept;
    
                } else if (currentUserRole != "Policy Holder") {
                    var pd = 0;
                    var bi = 0;
                    var total = pd + bi;
    
                    console.log(req.body.data.carrierInfo);
                    policyTraxn.Role = "carrier";
                    policyTraxn.carrierInfo = [];
                    for (let i in req.body.data.carrierInfo) {
                        var carrierConcept = policy.carrierInfo[i];
                        carrierConcept.LineNo = req.body.data.carrierInfo[i].LineNo;
                        carrierConcept.PostalCode = req.body.data.carrierInfo[i].PostalCode;
                        carrierConcept.bindingVal = req.body.data.carrierInfo[i].bindingVal;
                        carrierConcept.constMach = req.body.data.carrierInfo[i].constMach;
    
                        let pdTotal = req.body.data.carrierInfo[i].bindingVal + req.body.data.carrierInfo[i].constMach;
                        carrierConcept.pdTotal = pdTotal;
                        pd = pd + pdTotal;
    
    
                        carrierConcept.BI_monthip = req.body.data.carrierInfo[i].BI_monthip;
                        bi = bi + req.body.data.carrierInfo[i].BI_monthip;
    
                        let totalVal = pdTotal + req.body.data.carrierInfo[i].BI_monthip;
                        carrierConcept.totVal = totalVal;
                        total = total + totalVal;
    
                        carrierConcept.sectionA = req.body.data.carrierInfo[i].sectionA;
                        let prem = totalVal * 0.0253093363;
                        carrierConcept.premium = prem;
                        carrierConcept.cntry_tax = req.body.data.carrierInfo[i].cntry_tax;
                        carrierConcept.taxTotal = prem * (req.body.data.carrierInfo[i].cntry_tax / 100);
                        console.log(colors.prompt(serializer.toJSON(carrierConcept)));
                        policyTraxn.carrierInfo.push(carrierConcept);
                    }
    
                    var insDetlsConcept = policy.insuranceAmount;
                    insDetlsConcept.property_damage = pd;
                    insDetlsConcept.busi_interupt = bi;
                    insDetlsConcept.Total = total;
                    console.log(colors.prompt(serializer.toJSON(insDetlsConcept)));
                    policyTraxn.insuranceDetails = insDetlsConcept;
                }
    
                // 6. Submit the transaction
                return bnUtil.connection.submitTransaction(policyTraxn).then(() => {
                    console.log("6. Transaction Submitted/Processed Successfully!!");
                    jsonObj.push({
                        "status": "Transaction Submitted",
                    });
                    bnUtil.connection.disconnect();
                    res.json({
                        jsonObj
                    });
                }).catch((error) => {
                    console.log(error);
                    jsonObj.push({
                        "error": error.toString()
                    });
                    bnUtil.connection.disconnect();
                    res.json({
                        jsonObj
                    });
                });
            });
        });

      /** PUT -> CLAIM CONFLICT
       * 
       */
      app.put('/ClaimConflict/:ClaimNo', (req, res) => {
            var jsonObj = [];
            const claimConflictTrans = "claimConflict";
            bnUtil.connect(req, res, (error) => {

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
                        console.log("Comment:" + req.body.data.comment);

                        if (!claim) console.log(req.params.ClaimNo + 'Not found');

                        bnUtil.connection.getAssetRegistry(NS_POLICY).then((policyReg) => {
                              console.log('Received Registry: ', policyReg.id);
                              return policyReg.get(claim.PolicyNo.$identifier);
                        }).then((policy) => {
                              console.log("Pol:" + policy.LeadCarrier);

                              console.log("Policy num: " + JSON.stringify(claim.PolicyNo.$identifier));

                              if (req.body.data.ClaimMode === 'Approved') {
                                    transaction.ClaimMode = "ClaimEvaluation";
                                    transaction.owner = claim.owner;
                                    transaction.comment = req.body.data.comment;
                              } else {
                                    transaction.owner = claim.Followers1;
                                    transaction.ClaimMode = claim.ClaimMode;
                                    transaction.comment = req.body.data.comment;
                              }

                              return transaction;
                        }).then((transaction) => {
                              console.log('TR: ' + transaction);
                              // 6. Submit the transaction
                              return bnUtil.connection.submitTransaction(transaction).then(() => {
                                    console.log("6. Transaction Submitted/Processed Successfully!!");
                                    bnUtil.connection.disconnect();
                                    jsonObj.push({
                                          "status": "Transaction Submitted",
                                    });
                                    res.json({
                                          jsonObj
                                    });
                              });
                        });
                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      /** PUT -> UPDATE CLAIM PREMIUM CHECK
       * 
       */
      app.put('/ClaimPremiumCheck/update/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const claimPremCheck = "claimPremCheck";
            bnUtil.connect(req, res, (error) => {

                  // Check for error
                  if (error) {
                        console.lolg(error);
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
                  PremiumCheck.Status = "Completed";

                  PremiumCheck.CreateDate = new Date(Date.now());
                  PremiumCheck.TargetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

                  transaction.premium = PremiumCheck;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        bnUtil.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      /** GET -> PREMIUMCHECK DETAILS
       * 
       */
      app.get('/ClaimPremiumCheck/:ClaimNo', (req, res) => {
            let jsonObj = [];
            bnUtil.connect(req, res, () => {
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
                        if (claim.checkPremium != null) {
                              jsonObj.push({
                                    "ClaimNo": claim.ClaimNo,
                                    "checkPremium": serializer.toJSON(claim.checkPremium)
                              });
                        }

                        if (claim.checkPremium == null) {
                              let checkPremium = [];
                              checkPremium.push({
                                    "premiumBeenPaiByPolHolder": false,
                                    "reinstatementApplicable": false,
                                    "reinstatementPaidByPolHolder": false
                              });


                              jsonObj.push({
                                    "ClaimNo": claim.ClaimNo,
                                    checkPremium
                              });
                        }


                        console.log("*************************");
                        console.log(jsonObj);
                        res.json({
                              jsonObj
                        });
                        bnUtil.disconnect();
                  });
            });
      });

      /** PUT -> UPDATE SEGMENTATION INFORMATION
       * 
       */
      app.put('/ClaimSegment/update/:ClaimNo', (req, res) => {
            var jsonObj = [];
            const claimSegment = "claimSegment";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, claimSegment, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  const segmentation = factory.newConcept(NS, 'Segmentation');
                  let relationship = factory.newRelationship(NS, PRTCP_PARTY, req.body.data.user);
                  segmentation.name = relationship;
                  segmentation.role = req.body.data.role;
                  segmentation.office = req.body.data.office;
                  segmentation.segDate = new Date(req.body.data.segDate);
                  segmentation.CreateDate = new Date(req.body.data.CreateDate);
                  segmentation.TargetDate = new Date(req.body.data.TargetDate);

                  transaction.segmnt = segmentation;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        bnUtil.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      /** GET -> SEGMENTATION DETAILS
       * 
       */
      app.get('/ClaimSegment/:ClaimNo', (req, res) => {
            var jsonObj = [];
            bnUtil.connect(req, res, () => {
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
                        if (claim.segmnt != null) {
                              jsonObj.push({
                                    "ClaimNo": claim.ClaimNo,
                                    "checkPremium": serializer.toJSON(claim.segmnt)
                              });
                        }


                        console.log("*************************");
                        console.log(jsonObj);
                        res.json({
                              jsonObj
                        });
                        bnUtil.disconnect();
                  });
            });
      });


      /** GET -> HOUSE KEEPING CHECK
       * 
       */
      app.get('/HouseKeepCheck/:ClaimNo', (req, res) => {
            let jsonObj = [];
            bnUtil.connect(req, res, () => {
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
                        if (claim.houseKeeping != null) {
                              jsonObj.push({
                                    "ClaimNo": claim.ClaimNo,
                                    "houseKeeping": serializer.toJSON(claim.houseKeeping)
                              });
                        }

                        if (claim.houseKeeping == null) {
                              let houseKeeping = [];
                              houseKeeping.push({
                                    "premiumBeenPaidByPolHolder": false,
                                    "reinstatementPremiumPaid": false,
                                    "anyFraud": false
                              });

                              jsonObj.push({
                                    "ClaimNo": claim.ClaimNo,
                                    houseKeeping
                              });
                        }
                        console.log("*************************");
                        console.log(jsonObj);
                        res.json({
                              jsonObj
                        });
                        bnUtil.disconnect();
                  });
            });
      });

      /** GET -> HOUSE KEEPING TABLE
       * 
       */
      app.get('/HouseKeepSanction/:ClaimNo', (req, res) => {
            let jsonObj = [];
            let table = [];
            bnUtil.connect(req, res, () => {
                  let claimRegistry = {};
                  return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                        console.log('1. Received Registry: ', registry.id);
                        claimRegistry = registry;
                        return claimRegistry.get(req.params.ClaimNo);
                  }).then((claim) => {
                        if (!claim) console.log(req.params.ClaimNo + 'Not found');

                        console.log("*************************");
                        //console.log(claim);

                        if (claim.houseKeeping != null) {
                              table.push({
                                    "Carrier": claim.owner.$identifier.toString(),
                                    "Status": claim.houseKeeping.Status
                              });
                        } else {
                              table.push({
                                    "Carrier": claim.owner.$identifier.toString(),
                                    "Status": "Pending"
                              });

                        }
                        console.log("*************************");
                        jsonObj.push({
                              table
                        });

                        res.json({
                              jsonObj
                        });
                        bnUtil.disconnect();
                  });
            });
      });

      /** PUT-> UPDATE HOUSEKEEPING CHECK
       * 
       * 
       */
      app.put('/HouseKeepCheck/update/:ClaimNo', (req, res) => {
            var jsonObj = [];
            const housekeep = "housekeep";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, housekeep, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  const houseKeeping = factory.newConcept(NS, 'houseKeeping');
                  houseKeeping.premiumBeenPaidByPolHolder = req.body.data.premiumBeenPaidByPolHolder;
                  houseKeeping.reinstatementPremiumPaid = req.body.data.reinstatementPremiumPaid;
                  houseKeeping.anyFraud = req.body.data.anyFraud;
                  houseKeeping.CreateDate = new Date(Date.now());
                  houseKeeping.TargetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
                  houseKeeping.Status = "Completed";
                  transaction.housekeep = houseKeeping;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        bnUtil.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      /** PUT -> ADDITIONAL INFORMATION
       * 
       * 
       */
      app.put('/claimAdditionalInfo/update/:ClaimNo', (req, res) => {
            var jsonObj = [];
            const addInfo = "claimAddtionalInfo";
            bnUtil.connect(req, res, async (error) => {

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

                  var serializer = bnDef.getSerializer();

                  const transaction = factory.newTransaction(NS_model, addInfo, req.params.ClaimNo, options);

                  transaction.PartyName = req.body.data.PartyName;
                  transaction.PartyType = req.body.data.PartyType;
                  transaction.Details = req.body.data.Details;
                  transaction.Status = req.body.data.Status;
                  transaction.receivedOn = new Date(req.body.data.receivedOn);

                  let relationship = factory.newRelationship(NS, AST_CLAIM, req.params.ClaimNo);
                  transaction.claim = relationship;

                  console.log(serializer.toJSON(transaction));

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });

                  }).catch((error) => {
                        console.log(error);
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        bnUtil.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });


      //Update the Claim SettlementAmt
      app.put('/UpdateClaimQuery/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionClaimQuery";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  console.log("before transaction");
                  transaction.ClaimQuery = req.body.ClaimQuery;
                  transaction.CreateDate = new Date();
                  transaction.TargetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);



                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/UpdateClaimQueryStatus/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionClaimSettlementAmountStatus";
            bnUtil.connect(req, res, (error) => {

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

                  console.log("before transaction", req.body.Status);
                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  transaction.Status = req.body.Status;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'

                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/UpdateClaimExpertOpinion/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionClaimExpertOpinion";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  console.log("before transaction");
                  transaction.ClaimExpertOpinion = req.body.ClaimExpertOpinion;
                  transaction.CreateDate = new Date();
                  transaction.TargetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);



                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/UpdateClaimExpertOpinionStatus/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionClaimExpertOpinionStatus";
            bnUtil.connect(req, res, (error) => {

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

                  console.log("before transaction", req.body.Status);
                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  transaction.Status = req.body.Status;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'

                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/PolicyholderApproval/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionUpdateClaimMode";
            bnUtil.connect(req, res, (error) => {

                  // Check for error
                  if (error) {
                        console.log(error);
                        process.exit(1);
                  }

                  // 2. Get the Business Network Definition
                  let bnDef = bnUtil.connection.getBusinessNetwork();
                  console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);

                  console.log(req.params.ClaimNo);
                  const user = req.headers["user"];

                  // 3. Get the factory
                  let factory = bnDef.getFactory();

                  // 4. Create an instance of transaction
                  let options = {
                        generate: false,
                        includeOptionalFields: false
                  };

                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  console.log("before transaction", transactionName);
                  transaction.ClaimMode = 'PH_Approved';
                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",

                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'

                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/ClaimAcknowledge/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionUpdateClaimMode";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  console.log("before transaction", transactionName);
                  transaction.ClaimMode = 'Acknowledge';
                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",

                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'

                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/MyPolicy', (req, res) => {

            var jsonObj = [];

            bnUtil.connect(req, res, () => {

                  return bnUtil.connection.getAssetRegistry(NS_POLICY)
                        .then(function (registry) {
                              return registry.getAll();
                        }).then((results2) => {
                              console.log('2. Received results2: ', results2);
                              for (var i = 0; i < results2.length; i++) {
                                    var obj = results2[i];
                                    console.log("*********");
                                    jsonObj.push({
                                          "PolicyHolder": obj.InsuredCompanyName,
                                          "Insurer": obj.Insurer.$identifier.toString(),

                                          "PolicyNo": obj.PolicyNo,
                                          "PolicyEffectiveDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                          "PolicyExpiryDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                          "PolicyLOB": obj.PolicyType,
                                          "PolicyStatus": "Active",
                                    });
                              }
                              console.log("*************************")
                              bnUtil.disconnect()
                              res.json({
                                    jsonObj
                              });

                        });
            });
      });

      app.get('/MyPolicy/:search', (req, res) => {

            var jsonObj = [];
            console.log("*********  MyCases - searching for : " + req.params.search);
            const needle  = req.params.search;            

            bnUtil.connect(req, res, () => {

                  return bnUtil.connection.getAssetRegistry(NS_POLICY)
                        .then(function (registry) {
                              return registry.getAll();
                        }).then((results2) => {
                              console.log('2. Received results2: ', results2);
                              for (var i = 0; i < results2.length; i++) {
                                    var obj = results2[i];
                                    console.log("*********");
                                    jsonObj.push({
                                          "PolicyHolder": obj.InsuredCompanyName,
                                          "Insurer": obj.Insurer.$identifier.toString(),

                                          "PolicyNo": obj.PolicyNo,
                                          "PolicyEffectiveDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                          "PolicyExpiryDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                          "PolicyLOB": obj.PolicyType,
                                          "PolicyStatus": "Active",
                                    });
                              }
                              console.log("*************************")
                              bnUtil.disconnect()
                              jsonObj = searchValues(jsonObj, needle)
                              res.json({
                                    jsonObj
                              });

                        });
            });
      });

      app.get('/tamycases', (req, res) => {
            var jsonObj = [];
            
            bnUtil.connect(req, res, () => {
                  var statement2 = 'SELECT org.lloyds.market.Policy';
                  var qry = bnUtil.connection.buildQuery(statement2)
                  console.log(qry);
                  return bnUtil.connection.query(qry).then((results2) => {
                        console.log('2. Received results2: ', results2);
                        for (var i = 0; i < results2.length; i++) {
                              var details = [];
                              var obj = results2[i];
                              if (obj.PolicyStatus != null) {
                                    let Status;
                                    if (obj.PolicyStatus == "ReviewInformation") {
                                          Status = "Pending";
                                    } else {
                                          Status = "Completed";
                                    }
                                    details.push({
                                          "Name": "Review Information",
                                          "PolicyNo": obj.PolicyNo,
                                          "CreateDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                          "Urgency": ((Math.abs(obj.ContractPeriod.EndDateTime) - new Date()) / 36e5).toFixed(),
                                          "TargetDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                          "Status": Status
                                    });
                              }
                              var obj = results2[i];
                              console.log("*********");
                              jsonObj.push({
                                    "Insured": obj.InsuredCompanyName,
                                    "PolicyNo": obj.PolicyNo,
                                    "Insurer": obj.Insurer.$identifier.toString(),
                                    "CreateDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                    "Urgency": ((Math.abs(obj.ContractPeriod.EndDateTime) - new Date()) / 36e5).toFixed(),
                                    "TargetDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                    "Status": "ReviewInformation",
                                    "details": details
                              });
                        }
                        console.log("*************************")
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/tamycases/:search', (req, res) => {
            var jsonObj = [];
            console.log("*********  MyCases - searching for : " + req.params.search);
            const needle  = req.params.search;            
            
            bnUtil.connect(req, res, () => {
                  var statement2 = 'SELECT org.lloyds.market.Policy';
                  var qry = bnUtil.connection.buildQuery(statement2)
                  console.log(qry);
                  return bnUtil.connection.query(qry).then((results2) => {
                        console.log('2. Received results2: ', results2);
                        for (var i = 0; i < results2.length; i++) {
                              var details = [];
                              var obj = results2[i];
                              if (obj.PolicyStatus != null) {
                                    let Status;
                                    if (obj.PolicyStatus == "ReviewInformation") {
                                          Status = "Pending";
                                    } else {
                                          Status = "Completed";
                                    }
                                    details.push({
                                          "Name": "Review Information",
                                          "PolicyNo": obj.PolicyNo,
                                          "CreateDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                          "Urgency": ((Math.abs(obj.ContractPeriod.EndDateTime) - new Date()) / 36e5).toFixed(),
                                          "TargetDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                          "Status": Status
                                    });
                              }
                              var obj = results2[i];
                              console.log("*********");
                              jsonObj.push({
                                    "Insured": obj.InsuredCompanyName,
                                    "PolicyNo": obj.PolicyNo,
                                    "Insurer": obj.Insurer.$identifier.toString(),
                                    "CreateDate": dateFormat(obj.ContractPeriod.StartDateTime),
                                    "Urgency": ((Math.abs(obj.ContractPeriod.EndDateTime) - new Date()) / 36e5).toFixed(),
                                    "TargetDate": dateFormat(obj.ContractPeriod.EndDateTime),
                                    "Status": "ReviewInformation",
                                    "details": details
                              });
                        }
                        console.log("*************************")
                        jsonObj = searchValues(jsonObj, needle)
                        res.json({
                              jsonObj
                        });
                  });
            });
      });      

      app.get('/MyCases', (req, res) => {

            var jsonObj = [];

            const user = req.headers["user"];
            bnUtil.connect(req, res, () => {
                  console.log("*************************")
                  return bnUtil.connection.getAssetRegistry(NS_CLAIM)
                        .then(function (registry) {

                              return registry.getAll();
                        }).then((results1) => {
                              return bnUtil.connection.getAssetRegistry(NS_POLICY)
                                    .then(function (registry) {

                                          return registry.getAll();
                                    }).then((results2) => {

                                          for (var i = 0; i < results1.length; i++) {
                                                let details = [];
                                                var obj = results1[i];
                                                console.log("*********");
                                                const owner = obj.owner.$identifier.toString()
                                                let iSowner = false;

                                                if (owner == user) {
                                                      iSowner = true;

                                                }

                                                let CSType = "SCAP";

                                                if (obj.ClaimEstimateLoss != undefined && parseInt(obj.ClaimEstimateLoss) > 250000) {
                                                      CSType = "Non SCAP";
                                                }


                                                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                                                var policy_obj = policyResult[0]

                                                console.log(obj.ClaimNo);
                                              
                                                if (obj.ClaimMode != null) { //ConflictofInterest
                                                      let Status;
                                                      if (obj.ClaimMode == "ConflictofInterest") {
                                                            Status = "Pending";
                                                      } else {
                                                            Status = "Completed";
                                                      }

                                                      details.push({
                                                            "Name": "Conflict Of Interest",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimCreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimTargetDate),
                                                            "Status": Status,

                                                      });
                                                }

                                                if (obj.segmnt != null) { //segmnt
                                                      details.push({
                                                            "Name": "Claim Evaluation",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.segmnt.CreateDate),
                                                            "Urgency": ((Math.abs(obj.segmnt.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.segmnt.TargetDate),
                                                            "Status": "Completed",

                                                      });
                                                }

                                                if (obj.ClaimSettlementAmount != null) {
                                                      details.push({
                                                            "Name": "Claim Settlement",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimSettlementAmount.CreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimSettlementAmount.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimSettlementAmount.TargetDate),
                                                            "Status": obj.ClaimSettlementAmount.Status
                                                      });

                                                }

                                                if (obj.checkPremium != null) { // to do 
                                                      details.push({
                                                            "Name": "Premium Check",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.checkPremium.CreateDate),
                                                            "Urgency": ((Math.abs(obj.checkPremium.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.checkPremium.TargetDate),
                                                            "Status": obj.checkPremium.Status,

                                                      });
                                                }




                                                if (obj.houseKeeping != null) {
                                                      details.push({
                                                            "Name": "House Keeping",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.houseKeeping.CreateDate),
                                                            "Urgency": ((Math.abs(obj.houseKeeping.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.houseKeeping.TargetDate),
                                                            "Status": obj.houseKeeping.Status

                                                      });
                                                }
                                                jsonObj.push({

                                                      "owner": owner,
                                                      "iSowner": iSowner,
                                                      "LOB": policy_obj.PolicyType, //obj.PolicyType, ClaimsBroker
                                                      "ClaimEstimateLoss": obj.ClaimEstimateLoss,
                                                      "ClaimsBroker": obj.ClaimsBroker.$identifier.toString(),
                                                      "Insurer": policy_obj.Insurer.$identifier.toString(),
                                                      "CSType": CSType,
                                                      "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                                      "ClaimNo": obj.ClaimNo,
                                                      "PolicyNo": policy_obj.PolicyNo,
                                                      "ClaimCreateDate": dateFormat(obj.ClaimCreateDate),
                                                      "ClaimUrgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                      "ClaimTargetDate": dateFormat(obj.ClaimTargetDate),
                                                      "ClaimMode": obj.ClaimMode,
                                                      "details": details,

                                                });
                                          }
                                          console.log("*************************")
                                          bnUtil.disconnect()
                                          res.json({
                                                jsonObj
                                          });
                                    });
                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'Exception occured,please check query and try again.'
                              });
                              res.json({
                                    jsonObj
                              });
                        });
            });
      });

      app.get('/MyCases/:search', (req, res) => {

            var jsonObj = [];

            console.log("*********  MyCases - searching for : " + req.params.search);
            const needle = req.params.search;
            const user = req.headers["user"];
            bnUtil.connect(req, res, () => {
                  console.log("*************************")
                  return bnUtil.connection.getAssetRegistry(NS_CLAIM)
                        .then(function (registry) {

                              return registry.getAll();
                        }).then((results1) => {
                              return bnUtil.connection.getAssetRegistry(NS_POLICY)
                                    .then(function (registry) {

                                          return registry.getAll();
                                    }).then((results2) => {

                                          for (var i = 0; i < results1.length; i++) {
                                                let details = [];
                                                var obj = results1[i];
                                                console.log("*********");
                                                const owner = obj.owner.$identifier.toString()
                                                let iSowner = false;

                                                if (owner == user) {
                                                      iSowner = true;

                                                }

                                                let CSType = "SCAP";

                                                if (obj.ClaimEstimateLoss != undefined && parseInt(obj.ClaimEstimateLoss) > 250000) {
                                                      CSType = "Non SCAP";
                                                }


                                                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                                                var policy_obj = policyResult[0]

                                                console.log(obj.ClaimCreateDate);
                                                console.log(policy_obj.PolicyNo);

                                                if (obj.ClaimMode != null) { //ConflictofInterest
                                                      let Status;
                                                      if (obj.ClaimMode == "ConflictofInterest") {
                                                            Status = "Pending";
                                                      } else {
                                                            Status = "Completed";
                                                      }

                                                      details.push({
                                                            "Name": "Conflict Of Interest",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimCreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimTargetDate),
                                                            "Status": Status,

                                                      });
                                                }

                                                if (obj.segmnt != null) { //segmnt
                                                      details.push({
                                                            "Name": "Claim Evaluation",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.segmnt.CreateDate),
                                                            "Urgency": ((Math.abs(obj.segmnt.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.segmnt.TargetDate),
                                                            "Status": "Completed",

                                                      });
                                                }

                                                if (obj.ClaimSettlementAmount != null) {
                                                      details.push({
                                                            "Name": "Claim Settlement",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimSettlementAmount.CreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimSettlementAmount.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimSettlementAmount.TargetDate),
                                                            "Status": obj.ClaimSettlementAmount.Status
                                                      });

                                                }

                                                if (obj.checkPremium != null) { // to do 
                                                      details.push({
                                                            "Name": "Premium Check",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.checkPremium.CreateDate),
                                                            "Urgency": ((Math.abs(obj.checkPremium.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.checkPremium.TargetDate),
                                                            "Status": obj.checkPremium.Status,

                                                      });
                                                }




                                                if (obj.houseKeeping != null) {
                                                      details.push({
                                                            "Name": "House Keeping",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.houseKeeping.CreateDate),
                                                            "Urgency": ((Math.abs(obj.houseKeeping.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.houseKeeping.TargetDate),
                                                            "Status": obj.houseKeeping.Status

                                                      });
                                                }
                                                jsonObj.push({

                                                      "owner": owner,
                                                      "iSowner": iSowner,
                                                      "LOB": policy_obj.PolicyType,//obj.PolicyType, ClaimsBroker
                                                      "ClaimEstimateLoss": obj.ClaimEstimateLoss,
                                                      "ClaimsBroker": obj.ClaimsBroker.$identifier.toString(),
                                                      "Insurer": policy_obj.Insurer.$identifier.toString(),
                                                      "CSType": CSType,
                                                      "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                                      "ClaimNo": obj.ClaimNo,
                                                      "PolicyNo": policy_obj.PolicyNo,
                                                      "ClaimCreateDate": dateFormat(obj.ClaimCreateDate),
                                                      "ClaimUrgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                      "ClaimTargetDate": dateFormat(obj.ClaimTargetDate),
                                                      "ClaimMode": obj.ClaimMode,
                                                      "details": details,

                                                });
                                          }
                                          console.log("*************************")
                                          bnUtil.disconnect()
                                          jsonObj = searchValues(jsonObj, needle)
                                          res.json({
                                                jsonObj
                                          });
                                    });
                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'exception occured'
                              });
                              res.json({
                                    jsonObj
                              });
                        });
            });
      });

      function searchValues(jsonObj, needle) {


            console.log('searching for: %s', needle);
            var re1 = new RegExp(needle, 'i');
            var matches = jsonObj.filter(matcher(re1));
            console.log('found count: %s', matches.length);
            console.log('found: %s', JSON.stringify(matches));

            return matches;

      }

      function matcher(regexp) {
            return function (obj) {
                  var found = false;
                  Object.keys(obj).forEach(function (key) {
                        if (!found) {
                              if ((typeof obj[key] == 'string') && regexp.exec(obj[key])) {
                                    found = true;
                              }
                        }
                  });
                  return found;
            };
      }

      app.get('/MyClaims', (req, res) => {

            var jsonObj = [];

            const user = req.headers["user"];
            bnUtil.connect(req, res, () => {

                  console.log("*************************")
                  return bnUtil.connection.getAssetRegistry(NS_CLAIM)
                        .then(function (registry) {
                              return registry.getAll();
                        }).then((results1) => {
                              return bnUtil.connection.getAssetRegistry(NS_POLICY)
                                    .then(function (registry) {
                                          return registry.getAll();
                                    }).then((results2) => {

                                          for (var i = 0; i < results1.length; i++) {
                                                let details = [];
                                                var obj = results1[i];
                                                console.log("*********");
                                                const owner = obj.owner.$identifier.toString()
                                                let iSowner = false;

                                                if (owner == user) {
                                                      iSowner = true;

                                                }

                                                let CSType = "SCAP";
                                                if (obj.ClaimEstimateLoss != undefined && parseInt(obj.ClaimEstimateLoss) > 250000) {
                                                      CSType = "Non SCAP";
                                                }

                                                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                                                var policy_obj = policyResult[0]

                                                console.log(obj.ClaimCreateDate);
                                                console.log(policy_obj.PolicyNo);

                                                if (obj.segmnt != null) { // to do 
                                                      details.push({
                                                            "Name": "Claim Evaluation",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.segmnt.CreateDate),
                                                            "Urgency": ((Math.abs(obj.segmnt.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.segmnt.TargetDate),
                                                            "Status": "Completed",

                                                      });
                                                }

                                                if (obj.ClaimSettlementAmount != null) {
                                                      details.push({
                                                            "Name": "Claim Settlement",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimSettlementAmount.CreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimSettlementAmount.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimSettlementAmount.TargetDate),
                                                            "Status": obj.ClaimSettlementAmount.Status
                                                      });
                                                }

                                                jsonObj.push({
                                                      "owner": owner,
                                                      "iSowner": iSowner,
                                                      "LOB": policy_obj.PolicyType, //obj.PolicyType, ClaimsBroker
                                                      "ClaimEstimateLoss": obj.ClaimEstimateLoss,
                                                      "ClaimsBroker": obj.ClaimsBroker.$identifier.toString(),
                                                      "Insurer": policy_obj.Insurer.$identifier.toString(),
                                                      "CSType": CSType,
                                                      "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                                      "ClaimNo": obj.ClaimNo,
                                                      "PolicyNo": policy_obj.PolicyNo,
                                                      "ClaimCreateDate": dateFormat(obj.ClaimCreateDate),
                                                      "ClaimUrgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                      "ClaimTargetDate": dateFormat(obj.ClaimTargetDate),
                                                      "ClaimMode": obj.ClaimMode,
                                                      "details": details,
                                                });
                                          }
                                          console.log("*************************")
                                          bnUtil.disconnect();
                                          res.json({
                                                jsonObj
                                          });
                                    });
                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'Exception occured,please check query and try again.'
                              });
                              res.json({
                                    jsonObj
                              });
                        });
            });
      });

      app.get('/MyClaims/:search', (req, res) => {

            var jsonObj = [];

            const user = req.headers["user"];
            console.log("*********  MyCases - searching for : " + req.params.search);
            const needle  = req.params.search;

            bnUtil.connect(req, res, () => {

                  console.log("*************************")
                  return bnUtil.connection.getAssetRegistry(NS_CLAIM)
                        .then(function (registry) {
                              return registry.getAll();
                        }).then((results1) => {
                              return bnUtil.connection.getAssetRegistry(NS_POLICY)
                                    .then(function (registry) {
                                          return registry.getAll();
                                    }).then((results2) => {

                                          for (var i = 0; i < results1.length; i++) {
                                                let details = [];
                                                var obj = results1[i];
                                                console.log("*********");
                                                const owner = obj.owner.$identifier.toString()
                                                let iSowner = false;

                                                if (owner == user) {
                                                      iSowner = true;

                                                }

                                                let CSType = "SCAP";
                                                if (obj.ClaimEstimateLoss != undefined && parseInt(obj.ClaimEstimateLoss) > 250000) {
                                                      CSType = "Non SCAP";
                                                }

                                                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                                                var policy_obj = policyResult[0]

                                                console.log(obj.ClaimCreateDate);
                                                console.log(policy_obj.PolicyNo);

                                                if (obj.segmnt != null) { // to do 
                                                      details.push({
                                                            "Name": "Claim Evaluation",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.segmnt.CreateDate),
                                                            "Urgency": ((Math.abs(obj.segmnt.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.segmnt.TargetDate),
                                                            "Status": "Completed",

                                                      });
                                                }

                                                if (obj.ClaimSettlementAmount != null) {
                                                      details.push({
                                                            "Name": "Claim Settlement",
                                                            "ClaimNo": obj.ClaimNo,
                                                            "PolicyNo": policy_obj.PolicyNo,
                                                            "CreateDate": dateFormat(obj.ClaimSettlementAmount.CreateDate),
                                                            "Urgency": ((Math.abs(obj.ClaimSettlementAmount.TargetDate) - new Date()) / 36e5).toFixed(),
                                                            "TargetDate": dateFormat(obj.ClaimSettlementAmount.TargetDate),
                                                            "Status": obj.ClaimSettlementAmount.Status
                                                      });
                                                }

                                                jsonObj.push({
                                                      "owner": owner,
                                                      "iSowner": iSowner,
                                                      "LOB": policy_obj.PolicyType, //obj.PolicyType, ClaimsBroker
                                                      "ClaimEstimateLoss": obj.ClaimEstimateLoss,
                                                      "ClaimsBroker": obj.ClaimsBroker.$identifier.toString(),
                                                      "Insurer": policy_obj.Insurer.$identifier.toString(),
                                                      "CSType": CSType,
                                                      "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                                      "ClaimNo": obj.ClaimNo,
                                                      "PolicyNo": policy_obj.PolicyNo,
                                                      "ClaimCreateDate": dateFormat(obj.ClaimCreateDate),
                                                      "ClaimUrgency": ((Math.abs(obj.ClaimTargetDate) - new Date()) / 36e5).toFixed(),
                                                      "ClaimTargetDate": dateFormat(obj.ClaimTargetDate),
                                                      "ClaimMode": obj.ClaimMode,
                                                      "details": details,
                                                });
                                          }
                                          console.log("*************************")
                                          bnUtil.disconnect();
                                          jsonObj = searchValues(jsonObj, needle)
                                          res.json({
                                                jsonObj
                                          });
                                    });
                        }).catch((error) => {
                              console.log(error);
                              jsonObj.push({
                                    "status": 'Exception occured,please check query and try again.'
                              });
                              res.json({
                                    jsonObj
                              });
                        });
            });
      });      

      app.get('/ClaimPDF/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            var results1;
            connection.connect(cardName).then(function () {
                  let policyRegistry = {}
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = connection.buildQuery(statement1)
                  //console.log(qry);
                  console.log("*************ClaimInvestigate************")
                  return connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        jsonObj.push({
                              "ClaimDetails1": obj.ClaimDetails1,
                              "ClaimDetails2": obj.ClaimDetails2,
                        });
                        console.log("*************************")
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/claimparties/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            connection.connect(cardName).then(function () {
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = connection.buildQuery(statement1)
                  console.log("*************claimparties************")
                  return connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        jsonObj.push({
                              "ClaimNumber": req.params.ClaimNumber,
                              "owner": obj.LeadCarrier.$identifier.toString(),
                              "LeadCarrier": obj.LeadCarrier.$identifier.toString(),
                              "PlacingBroker": obj.PlacingBroker.$identifier.toString(),
                              "ClaimsBroker": obj.ClaimsBroker.$identifier.toString(),
                              "OverseasBroker": obj.LeadCarrier.$identifier.toString(),
                              "PolicyOwner": obj.PolicyOwner.$identifier.toString(),
                              "Followers1": obj.Followers1.$identifier.toString(),
                              "Followers2": obj.Followers2.$identifier.toString(),
                              "Followers3": obj.Followers3.$identifier.toString(),
                              "Followers4": obj.Followers4.$identifier.toString(),
                        });
                        console.log("*************************")
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/getClaimSettlement/:ClaimNumber', (req, res) => { //using admin card
            var jsonObj = [];
            connection.connect(cardName).then(function () {
                  let bnDef = connection.getBusinessNetwork();
                  console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = connection.buildQuery(statement1)
                  console.log("************getClaimSettlement*************")
                  return connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        var statement2 = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                        var qry = connection.buildQuery(statement2)
                        console.log(qry);
                        return connection.query(qry, {
                              id: obj.PolicyNo.$identifier.toString()
                        }).then((results2) => {
                              console.log('2. Received results2: ', results2);
                              var policy_obj = results2[0]
                              let details = [];
                              if (obj.ClaimSettlementAmount != null) {

                                    let Status;
                                    if (obj.ClaimSettlementAmount.Status != "Completed") {
                                          Status = "Pending";
                                    } else {
                                          Status = "Agreed";
                                    }
                                    details.push({
                                          "PartyName": policy_obj.InsuredCompanyName,
                                          "PartyType": "Policyholder",
                                          "SettlementAmount": obj.ClaimSettlementAmount.Amount,
                                          "Confirmation": Status,
                                    });
                                    jsonObj.push({
                                          "Lead": obj.LeadCarrier.$identifier.toString(),
                                          "SettlementAmount": obj.ClaimSettlementAmount.Amount,
                                          details
                                    });
                              }

                              console.log("***********getClaimSettlement ends**************")
                              res.json({
                                    jsonObj
                              });
                        });
                  });
            });
      });

      app.get('/PolicyPDF/:PolicyNo', (req, res) => {
            var jsonObj = [];
            var results1;
            bnUtil.connect(req, res, () => {
                  let policyRegistry = {}
                  var statement1 = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                  var qry = bnUtil.connection.buildQuery(statement1)
                  //console.log(qry);
                  console.log("*************ClaimInvestigate************")
                  return bnUtil.connection.query(qry, {
                        id: req.params.PolicyNo
                  }).then((results1) => {
                        var obj = results1[0];
                        jsonObj.push({
                              "PolicyDetails1": obj.PolicyDetails1,
                        });
                        console.log("*************************")
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/ClaimEvaluation/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            let ClaimSegmentation = [];
            let ClaimExpertOpinion = "";
            let ClaimQuery = "";
            let ClaimAckBy = "";
            let AdditionalInfo = [];

            connection.connect(cardName).then(function () {
                  let bnDef = connection.getBusinessNetwork();
                  console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = connection.buildQuery(statement1)
                  console.log("************ClaimEvaluation*************")
                  return connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        var statement2 = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                        var qry = connection.buildQuery(statement2)
                        console.log(qry);
                        return connection.query(qry, {
                              id: obj.PolicyNo.$identifier.toString()
                        }).then((results2) => {
                              console.log('2. Received results2: ', results2);
                              var policy_obj = results2[0]

                              if (obj.segmnt != null) {
                                    let CSType = "SCAP";
                                    let table = [];
                                    if (obj.ClaimEstimateLoss != undefined && parseInt(obj.ClaimEstimateLoss) > 250000) {
                                          CSType = "Non SCAP";
                                    }
                                    table.push({
                                          "Name": obj.segmnt.name.$identifier.toString(),
                                          "Role": obj.segmnt.role,
                                          "Date": obj.segmnt.segDate,
                                    });
                                    ClaimSegmentation.push({
                                          "CSType": CSType,
                                          "Name": "Claim Segmentation",
                                          table
                                    });
                                    jsonObj.push({
                                          ClaimSegmentation
                                    });
                              }
                              if (obj.ClaimExpertOpinion != null) {
                                    ClaimExpertOpinion = obj.ClaimExpertOpinion.ClaimExpertOpinion;
                              }
                              if (obj.ClaimQuery != null) {
                                    ClaimQuery = obj.ClaimQuery.ClaimQuery;
                              }
                              if (obj.ClaimMode != "ConflictofInterest") {
                                    ClaimAckBy = obj.owner.$identifier.toString();
                              }

                              if (obj.additionalInfo != null) {

                                    let table = [];
                                    for (var i = 0; i < obj.additionalInfo.length; i++) {
                                          let infoObj = obj.additionalInfo[i]

                                          table.push({
                                                "PartyName": infoObj.PartyName,
                                                "PartyType": infoObj.PartyType,
                                                "Details": infoObj.Details,
                                                "Status": infoObj.Status,
                                                "ReceivedOn": infoObj.timestamp,
                                          });
                                    }
                                    AdditionalInfo.push({
                                          "Name": obj.owner.$identifier.toString(),
                                          table
                                    });
                                    jsonObj.push({
                                          AdditionalInfo
                                    });
                              }
                              console.log("***********ClaimEvaluation ends**************")
                              res.json({
                                    ClaimSegmentation,
                                    ClaimExpertOpinion,
                                    ClaimQuery,
                                    ClaimAckBy,
                                    AdditionalInfo
                              });
                        });
                  });
            });
      });

      app.get('/getConflictOfInterest/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            var results1;
            bnUtil.connect(req, res, () => {
                  let policyRegistry = {}
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = bnUtil.connection.buildQuery(statement1)
                  //console.log(qry);
                  console.log("*************ClaimInvestigate************")
                  return bnUtil.connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        if (obj.ClaimMode != "Pending") {
                              jsonObj.push({
                                    "Status": true,
                              });
                        } else {
                              jsonObj.push({
                                    "Status": false,
                              });

                        }

                        console.log("*************************")
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      app.get('/getClaimSeg/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            bnUtil.connect(req, res, () => {
                  let bnDef = bnUtil.connection.getBusinessNetwork();
                  console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = bnUtil.connection.buildQuery(statement1)
                  console.log("************getClaimSettlement*************")
                  return bnUtil.connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        var statement2 = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                        var qry = bnUtil.connection.buildQuery(statement2)
                        console.log(qry);
                        return bnUtil.connection.query(qry, {
                              id: obj.PolicyNo.$identifier.toString()
                        }).then((results2) => {
                              console.log('2. Received results2: ', results2);
                              var policy_obj = results2[0]
                              let details = [];
                              const bnDef = bnUtil.connection.getBusinessNetwork();
                              var serializer = bnDef.getSerializer();

                              if (obj.segmnt != null) {
                                    console.log(serializer.toJSON(obj.segmnt))
                                    details.push({
                                          "Name": obj.segmnt.name.$identifier.toString(),
                                          "Role": obj.segmnt.role,
                                          "Date": obj.segmnt.segDate,
                                    });
                              }
                              jsonObj.push({
                                    "Type": "SCAP",
                                    "Name": "Claim Segmentation",
                                    details
                              });

                              console.log("***********getClaimSettlement ends**************")
                              res.json({
                                    jsonObj
                              });
                        });
                  });
            });
      });

      app.get('/getadditionalInfo/:ClaimNumber', (req, res) => {
            var jsonObj = [];
            bnUtil.connect(req, res, () => {
                  let bnDef = bnUtil.connection.getBusinessNetwork();
                  console.log(`2. Received Definition from Runtime: ${bnDef.getName()} -v ${bnDef.getVersion()}`);
                  var statement1 = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
                  var qry = bnUtil.connection.buildQuery(statement1)
                  console.log("************getClaimSettlgetadditionalInfoement*************")
                  return bnUtil.connection.query(qry, {
                        id: req.params.ClaimNumber
                  }).then((results1) => {
                        var obj = results1[0];
                        var statement2 = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
                        var qry = bnUtil.connection.buildQuery(statement2)
                        //console.log(qry);
                        return bnUtil.connection.query(qry, {
                              id: obj.PolicyNo.$identifier.toString()
                        }).then((results2) => {
                              //console.log('2. Received results2: ', results2);
                              var policy_obj = results2[0]
                              let details = [];
                              const bnDef = bnUtil.connection.getBusinessNetwork();
                              var serializer = bnDef.getSerializer();

                              if (obj.getadditionalInfo != null) {
                                    console.log(serializer.toJSON(obj.getadditionalInfo))
                                    // details.push({
                                    //     "Name": obj.segmnt.name.$identifier.toString(),
                                    //     "Role": obj.segmnt.role,
                                    //     "Date": obj.segmnt.segDate,
                                    // });
                              }
                              // jsonObj.push({
                              //   //  "Type": "SCAP",
                              //   //  "Name": "Claim Segmentation",
                              //   //  details
                              // });

                              console.log("***********getClaimSettlement ends**************")
                              res.json({
                                    jsonObj
                              });
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/UpdateSettlementAmt/:ClaimNo', (req, res) => {
            var jsonObj = [];

            const transactionName = "TransactionClaimSettlementAmount";
            bnUtil.connect(req, res, (error) => {

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

                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  console.log("before transaction");
                  transaction.Amount = req.body.Amount;
                  transaction.Status = req.body.Status;
                  transaction.CreateDate = new Date();
                  transaction.TargetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);


                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'
                        });
                        console.log(error);
                        bnUtil.connection.disconnect();
                        res.json({
                              jsonObj
                        });
                  });
            });
      });

      //Update the Claim SettlementAmt
      app.put('/UpdateSettlementAmtStatus/:ClaimNo', (req, res) => {
            var jsonObj = [];
            const transactionName = "TransactionClaimSettlementAmountStatus";
            bnUtil.connect(req, res, (error) => {

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

                  console.log("before transaction", req.body.Status);
                  const transaction = factory.newTransaction(NS_model, transactionName, req.params.ClaimNo, options);
                  transaction.claimId = req.params.ClaimNo;

                  transaction.Status = req.body.Status;

                  // 6. Submit the transaction
                  return bnUtil.connection.submitTransaction(transaction).then(() => {
                        console.log("6. Transaction Submitted/Processed Successfully!!");
                        bnUtil.disconnect();
                        jsonObj.push({
                              "status": "Transaction Submitted",
                        });
                        res.json({
                              jsonObj
                        });
                  }).catch((error) => {
                        jsonObj.push({
                              "status": 'Exception occured,please check query and try again.'

                        });
                        console.log(error);
                        bnUtil.connection.disconnect();


                        res.json({
                              jsonObj
                        });
                  });
            });
      });

};


function dateFormat(dateVal) {
      var newDate = new Date(dateVal);

      var sMonth = padValue(newDate.getMonth() + 1);
      var sDay = padValue(newDate.getDate());
      var sYear = newDate.getFullYear();
      var sHour = newDate.getHours();
      var sMinute = padValue(newDate.getMinutes());
      var sAMPM = "AM";

      var iHourCheck = parseInt(sHour);

      if (iHourCheck > 12) {
            sAMPM = "PM";
            sHour = iHourCheck - 12;
      } else if (iHourCheck === 0) {
            sHour = "12";
      }

      sHour = padValue(sHour);

      return sMonth + "-" + sDay + "-" + sYear + " " + sHour + ":" + sMinute + " " + sAMPM;
}

function padValue(value) {
      return (value < 10) ? "0" + value : value;
}


function getCardName(user) {

      return user.concat("-card@lloyds-project-11")
}


function timeDifference(date) {

      //        console.log(date > new Date())
      if (date < new Date()) {
            var seconds = Math.floor((new Date() - date) / 1000);
      } else {
            var seconds = Math.floor((date - new Date()) / 1000);
      }

      //console.log(seconds)
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

/** RETURN INSURED ADDRESS
 * 
 */
function getPartyAdress(req, res, party) {
      console.log('***CODE STARTED****');
      console.log(party);
      return new Promise((resolve, reject) => {
            bnUtil.connect(req, res, async (error) => {
                  let address = {};
                  // Check for error
                  if (error) {
                        console.log(error);
                        process.exit(1);
                  }

                  let bnDef = bnUtil.connection.getBusinessNetwork();

                  const usrRegistry = await bnUtil.connection.getParticipantRegistry('org.lloyds.market._Party');
                  let isExist = await usrRegistry.exists(party);
                  if (isExist) {
                        const usrinf = await usrRegistry.get(party);
                        var serializer = bnDef.getSerializer();
                        //console.log(serializer.toJSON(usrinf.Address));
                        address = serializer.toJSON(usrinf.Address);
                        bnUtil.disconnect();
                        resolve(address);
                  } else {
                        reject(Error(`Invalid user: ${party}`)).then(() => {}, (error) => {
                              consol.log(error);
                        });
                  }
            });
      });
}


async function getRole(req, res) {

      return new Promise((resolve, reject) => {

            bnUtil.connect(req, res, async (error) => {
                  let role = {};
                  // Check for error
                  if (error) {
                        console.log(error);
                        process.exit(1);
                  }

                  let bnDef = bnUtil.connection.getBusinessNetwork();
                  const usrRegistry = await bnUtil.connection.getParticipantRegistry('org.lloyds.market._Party');
                  let isExist = await usrRegistry.exists(req.headers.user);
                  if (isExist) {
                        const usrinf = await usrRegistry.get(req.headers.user);
                        var serializer = bnDef.getSerializer();
                        role = serializer.toJSON(usrinf);
                        console.log(role.Role);

                        resolve(role.Role);
                  } else {
                        bnUtil.disconnect();
                  }
            });
      });
}


colors.setTheme({
      silly: 'rainbow',
      input: 'grey',
      verbose: 'cyan',
      prompt: 'grey',
      info: 'green',
      data: 'grey',
      help: 'cyan',
      warn: 'yellow',
      debug: 'blue',
      error: 'red',
      custom: ['yellow', 'bold']
});

function sanitize(obj) {

      delete obj['$class'];

      let arr = ["InsuredMailingAddress", "FinancialOverview", "Followers", "BrokerPlacing", "BrokerOverSeas", "TotalSumInsured", "polLayerinfo", "ContractPeriod", "Sublimits", "CarrierInfo"];

      for (let i in arr) {
            if (obj.hasOwnProperty(arr[i])) {
                  console.log(colors.warn(arr[i] + '->' + Array.isArray(obj[arr[i]])));
                  if (Array.isArray(obj[arr[i]])) {
                        for (let j in obj[arr[i]]) {
                              delete obj[arr[i]][j]['$class'];
                        }
                  }
                  delete obj[arr[i]]['$class'];
            }
      }

      return obj;
}

async function generateXML() {
      console.log(colors.custom('***Generate XML***'));
      let req = {
            "headers": {
                  "user": "Isabelle",
                  "password": "1234"
            }
      };

      console.log(req);

      let res = "";
      bnUtil.connect(req, res, async (error) => {

            var filePath = "/tmp/sample.xml";

            const polRegistry = await bnUtil.connection.getAssetRegistry('org.lloyds.market.Policy');
            let polid = "2445";
            let isExist = await polRegistry.exists(polid);
            console.log(isExist);
            if (isExist) {
                  let bnDef = bnUtil.connection.getBusinessNetwork();
                  const pol = await polRegistry.get(polid);
                  var serializer = bnDef.getSerializer();
                  let polObj = serializer.toJSON(pol);
                  console.log(colors.data(sanitize(polObj)));

                  var myxml = (js2xmlparser.parse("Policy", sanitize(polObj)));
                  fs.appendFile(filePath, myxml, function (err) {
                        if (err) throw err;
                        console.log(colors.silly('Saved!'));
                  });

                  bnUtil.disconnect();
            }
      });
}
//getIsuredAdress();
async function getUserName(party, password) {
      return new Promise((resolve, reject) => {
            connection.connect(cardName).then(function () {
                  console.log("Fetching uset details for user ", party);
                  connection.getParticipantRegistry('org.lloyds.market._Party')
                        .then(function (playerRegistry) {
                              return playerRegistry.exists(party);
                        })
                        .then(function (exists) {
                              if (exists) {
                                    console.log("user exists");
                                    return connection.getParticipantRegistry('org.lloyds.market._Party')
                                          .then(function (assetRegistry) {
                                                return assetRegistry.get(party);
                                          })
                                          .then(function (user) {
                                                return (user.Name);

                                          });

                              } else {
                                    return (party);
                              }
                        });
            });
      });
}