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

    app.get('/MyCases', (req, res) => {

        var jsonObj = [];
        var results1;
        var results2;
        var claim_obj;
        var policy_obj;
        bnUtil.connect(req, () => {
            let policyRegistry = {}
            var statement1 = 'SELECT org.lloyds.market.Claim';
            var qry = bnUtil.connection.buildQuery(statement1)
            //console.log(qry);
            return bnUtil.connection.query(qry).then((results1) => {
                //console.log('1. Received results1: ', results1[0]);

                var statement2 = 'SELECT org.lloyds.market.Policy';
                var qry = bnUtil.connection.buildQuery(statement2)
                console.log(qry);

                return bnUtil.connection.query(qry).then((results2) => {
                    console.log('2. Received results2: ', results2);


                    for (var i = 0; i < results1.length; i++) {
                        var obj = results1[i];
                        console.log("*********");
                        console.log(obj.PolicyNo.$identifier)
                        var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                        var policy_obj = policyResult[0]
                        console.log(policy_obj.PolicyNo)
                        {
                            jsonObj.push({
                                "InsuredCompanyName": policy_obj.InsuredCompanyName,
                                "ClaimNo": obj.ClaimNo,
                                "PolicyNo": policy_obj.PolicyNo,
                                "ClaimCreateDate ": obj.ClaimCreateDate,
                                "ClaimUrgency ": timeDifference(obj.ClaimTargetDate),
                                "ClaimTargetDate ": obj.ClaimTargetDate,
                                "ClaimMode": obj.ClaimMode,

                            });
                        }
                    }
                    console.log("*************************")
                    res.json({ jsonObj });

                });


            });
        });
    });

    function timeDifference(date) {

//        console.log(date > new Date())
        if (date < new Date()) {
            var seconds = Math.floor((new Date() - date) / 1000);
        }
        else {
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

}