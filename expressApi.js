
'use strict';

const bnc = require('composer-client').BusinessNetworkConnection;
const connection = new bnc();
var Client = require('node-rest-client').Client;
var restclient = new Client();

const bnUtil = require('./dlt-connection-util');

module.exports = function (app) {

    app.put('/ClaimConflict/:ClaimNo', (req, res) => {
        console.log('NEW CODE..');
        bnUtil.connect(req, () => {
            let claimRegistry = {}
            return bnUtil.connection.getAssetRegistry('org.lloyds.market.Claim').then((registry) => {
                console.log('1. Received Registry: ', registry.id);
                claimRegistry = registry;
                return claimRegistry.get(req.params.ClaimNo);
            }).then((claim) => {
                if (!claim) console.log(req.params.ClaimNo + 'Not found');

                // const policy = await getAssetRegistry('org.lloyds.market.Policy');

                bnUtil.connection.getAssetRegistry('org.lloyds.market.Policy').then((policyReg) => {
                    return policyReg.get(claim.PolicyNo.$identifier);
                }).then((policy) => {
                    console.log("Pol:" + policy.LeadCarrier);

                    console.log(JSON.stringify(claim.PolicyNo.$identifier));

                    if (req.body.ClaimMode === 'Approved')
                        claim.ClaimMode = req.body.ClaimMode;

                    /** To set the new relation below is the sample */
                    //const bnDef = bnUtil.getBusinessNetwork();
                    //const factory = bnDef.getFactory();

                    //let relationship = factory.newRelationship('org.lloyds.market', 'Owner', 'Isabelle');
                    // claim.owner = relationship;

                    claim.owner = policy.LeadCarrier;

                    return claimRegistry.update(claim).then(() => {
                        console.log('Updated successfully!!!');
                        res.end("Updated successfully");
                        bnUtil.connection.disconnect();
                    });
                });
            }).catch((error) => {
                console.log(error);
                connection.disconnect();
            });

        });
    });
};

