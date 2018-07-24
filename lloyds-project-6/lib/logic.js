/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getParticipantRegistry getAssetRegistry getFactory */


/*jshint esversion: 6 */
/*jshint node: true */


const AST_POLICY = 'Policy';
const AST_CLAIM = 'Claim';
const PRTCP_PARTY = '_Party';

const NS = 'org.lloyds.market';
const NS_PARTY = 'org.lloyds.market._Party';
const NS_CLAIM = 'org.lloyds.market.Claim';
const NS_POLICY = 'org.lloyds.market.Policy';


/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.lloyds.model.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */

async function setupDemo(xData) { // eslint-disable-line no-unused-vars

      const factory = getFactory();

      //Create Policy
      const policy = factory.newResource(NS, AST_POLICY, xData.PolicyNo);
      policy.InsuredCompanyName = xData.InsuredCompanyName;
      policy.PolicyType = xData.PolicyType;
      policy.PolicyDetails1 = xData.PolicyDetails1;
      policy.LeadCarrier = xData.LeadCarrier;

      const effectiveDate = xData.timestamp;
      effectiveDate.setDate(effectiveDate.getDate());

      policy.PolicyEffectiveDate = effectiveDate;
      policy.PolicyExpiryDate = PolicyExpiryDate;

      // add Policy to registry
      const policyRegistry = await getAssetRegistry(NS_POLICY);
      await policyRegistry.addAll([policy]);
}


/**
 * CreateClaim Transaction
 * @param {org.lloyds.model.CreateClaim} CreateClaim
 * @transaction
 * 
 */
function createclaim(claimData) {
      return getAssetRegistry('org.lloyds.market.Claim')

            .then(function (ClaimRegistry) {
                  // Now add the claim - global function getFactory() called
                  var factory = getFactory();

                  var NS = 'org.lloyds.model.CreateClaim';

                  // Solution to exercise - Removed hardcoded value & invoked
                  // generate the claim ID
                  // 2.1 Set the claimNumber, claimId ... 

                  var claim = factory.newResource('org.lloyds.market', 'Claim', claimData.ClaimNo);

                  claim.ClaimCreatedBy = claimData.ClaimCreatedBy;
                  claim.ClaimMode = claimData.ClaimMode;
                  claim.ClaimDetails1 = claimData.ClaimDetails1;
                  claim.ClaimDetails2 = claimData.ClaimDetails2;
                  claim.ClaimPremiumStatus = claimData.ClaimPremiumStatus;
                  claim.ClaimActionRequired = claimData.ClaimActionRequired;

                  claim.ClaimCreateDate = claimData.ClaimCreateDate;
                  claim.ClaimDateofLoss = claimData.ClaimDateofLoss;

                  let policy = factory.newRelationship('org.lloyds.market', 'Policy', claimData.PolicyNo);
                  claim.PolicyNo = policy;

                  let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.owner);
                  claim.owner = _Party;

                  if (claimData.LeadCarrier) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.LeadCarrier);
                        claim.LeadCarrier = _Party;
                  }
                  if (claimData.PlacingBroker) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.PlacingBroker);
                        claim.PlacingBroker = _Party;
                  }
                  if (claimData.ClaimsBroker) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.ClaimsBroker);
                        claim.ClaimsBroker = _Party;
                  }
                  if (claimData.OverseasBroker) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.OverseasBroker);
                        claim.OverseasBroker = _Party;
                  }
                  if (claimData.PolicyOwner) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.PolicyOwner);
                        claim.PolicyOwner = _Party;
                  }
                  if (claimData.Followers1) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers1);
                        claim.Followers1 = _Party;
                  }
                  if (claimData.Followers2) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers2);
                        claim.Followers2 = _Party;
                  }
                  if (claimData.Followers3) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers3);
                        claim.Followers3 = _Party;
                  }
                  if (claimData.Followers4) {
                        let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers4);
                        claim.Followers4 = _Party;
                  }

                  // 3 Emit the event claimCreated
                  var event = factory.newEvent('org.lloyds.model', 'CreateClaimCreated');
                  event.ClaimNo = claimData.ClaimNo;
                  event.PolicyNo = claimData.PolicyNo;
                  event.ClaimDateofLoss = claimData.ClaimDateofLoss;
                  event.LeadCarrier = claimData.LeadCarrier;
                  event.PlacingBroker = claimData.PlacingBroker;
                  event.ClaimsBroker = claimData.ClaimsBroker;
                  event.OverseasBroker = claimData.OverseasBroker;
                  event.PolicyOwner = claimData.PolicyOwner;
                  event.Followers1 = claimData.Followers1;
                  event.Followers2 = claimData.Followers2;
                  event.Followers3 = claimData.Followers3;
                  event.Followers4 = claimData.Followers4;

                  emit(event);

                  // 4. Add to registry
                  return ClaimRegistry.add(claim);
            });
}

/** * claimConflict Transaction
 * @param {org.lloyds.model.claimConflict} claimConflict
 * @transaction
 */
async function claimConflict(xData) {
      // Update claim
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      const claim = await claimRegistry.get(xData.claimId);
      claim.ClaimMode = xData.ClaimMode;
      claim.owner = xData.owner;
      claim.LeadCarrier = xData.LeadCarrier;
      await claimRegistry.update(claim);
}

/** claimPremCheck Transaction
 * @param {org.lloyds.model.claimPremCheck} claimPremCheck
 * @transaction
 */
async function claimPremCheck(xData) {
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      const claim = await claimRegistry.get(xData.claimId);
      claim.checkPremium = xData.premium;
      await claimRegistry.update(claim);
}