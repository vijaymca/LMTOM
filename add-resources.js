'use strict';
/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * Sample shows how to use asset registry for adding new instances 
 * of resources. Code creates 2 instances of the Aircraft asset and
 * adds to the AssetRegistry by invoking the addAll() function.
 * 
 * Please note that if the Aircraft with ID = CRAFT01 | CRAFT02 already
 * exist then the call to addAll() will fail.
 * 
 * Execution environment
 * =====================
 * 1. Fabric runtime is up
 * 2. aircraftv7 deployed
 * 3. No asset in the flight registry for CRAFT01, CRAFT02
 * 
 * Demo Steps
 * ==========
 * 1. Connect using the bn-connection-util
 * 2. Get the AssetRegistry from connection
 * 3. Create 2 instances of Aircraft resource using the factory & initialize
 * 4. Invoke registry.addAll([Array of Aircraft resource instances])
 */

const NS = 'org.lloyds.market';
const policyType = 'Policy';

// 1. Connect
const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main(error) {
    // Check for the connection error
    if (error) {
        console.log(error);
        process.exit(1);
    }

    // 2. Get the aircraft AssetRegistry
    return bnUtil.connection.getAssetRegistry(NS + '.' + policyType).then((registry) => {
        console.log('1. Received Registry: ', registry.id);

        // Utility method for adding the aircrafts
        addPolicies(registry);

    }).catch((error) => {
        console.log(error);
        // bnUtil.disconnect();
    });
}

/**
 * Creates two resources instances CRAFT01 & CRAFT02
 * @param {*} registry This is of type AssetRegistry
 */
function addPolicies(registry) {
    // 3. This Array will hold the instances of aircraft resource
    let policies = [];
    const bnDef = bnUtil.connection.getBusinessNetwork();
    const factory = bnDef.getFactory();
    // Instance#1
    let policyResource = factory.newResource(NS, policyType, 'CCR Y0001PR0027123');

    let followers = ["Dakota (DKT 7809)", "Bleachers Re (BRE 3290)", "Towers Inc (TWR 2244)"];
    
    policyResource.setPropertyValue('InsuredCompanyName', 'James Bowling Estates');
    policyResource.setPropertyValue('PolicyType', 'CommercialProp');
    policyResource.setPropertyValue('PolicyDetails1', 'ATL...');
    policyResource.setPropertyValue('LeadCarrier', 'Fortitude (FRT 2100)');
    policyResource.setPropertyValue('PlacingBroker', 'WideWorld Broking limited');
    policyResource.setPropertyValue('ClaimsBroker', 'Lloyds Claim Broker');
    policyResource.setPropertyValue('OverseasBroker', 'Lloyds Claim Broker');
    policyResource.setPropertyValue('Followers', followers);

    policyResource.setPropertyValue('PolicyEffectiveDate', new Date('2018-10-15T21:44Z'));
    policyResource.setPropertyValue('PolicyExpiryDate', new Date('2019-10-15T21:44Z'));

    // Push instance to  the aircrafts array
    policies.push(policyResource);

    // Instance#2 
    policyResource = factory.newResource(NS, policyType, 'CCR Y0001PR0027999');
    // You may use direct assignment instead of using the setPropertyValue()
    policyResource.InsuredCompanyName = 'James Bowling Estates2';
    policyResource.PolicyType = 'CommercialProp';
    policyResource.PolicyDetails1 = 'ATL...2222';
    policyResource.LeadCarrier = 'Fortitude (FRT 2100)2';
    policyResource.PlacingBroker = 'PlacingBroker', 'WideWorld Broking limited-222';
    policyResource.ClaimsBroker = 'Lloyds Claim Broker-22';
    policyResource.OverseasBroker = 'Lloyds Claim Broker-22';
    policyResource.Followers = followers;

    policyResource.PolicyEffectiveDate = new Date('2018-11-15T21:44Z');
    policyResource.PolicyExpiryDate = new Date('2019-11-15T21:44Z');

    // Push instance to  the aircrafts array
    policies.push(policyResource);

    // 4. Add the Aircraft resource to the registry
    return registry.addAll(policies).then(() => {
        console.log('Added the Resources successfully!!!');
        bnUtil.disconnect();
    }).catch((error) => {
        console.log(error);
        bnUtil.disconnect();
    });
}