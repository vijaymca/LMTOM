
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

async function setupDemo(xData) {  // eslint-disable-line no-unused-vars

  const factory = getFactory();

  //Create Policy
  const policy = factory.newResource(NS, AST_POLICY, xData.PolicyNo);
  policy.InsuredCompanyName = xData.InsuredCompanyName;
  policy.PolicyType = xData.PolicyType;
  policy.PolicyDetails1 = xData.PolicyDetails1;
  policy.LeadCarrier = xData.LeadCarrier;

  //policy.Followers = xData;
  //policy.PolicyStatus = xData;

  const effectiveDate = xData.timestamp;
  effectiveDate.setDate(effectiveDate.getDate());

  policy.PolicyEffectiveDate = effectiveDate;
  policy.PolicyExpiryDate = effectiveDate;

  // add Policy to registry
  const policyRegistry = await getAssetRegistry(NS_POLICY);
  await policyRegistry.addAll([policy]);

  /*
  
    // Crete claim
    const claim = factory.newResource(NS, AST_CLAIM, '678XZ76522');
    claim.ClaimCreatedBy = 'Fortitude (FRT 2100)';
    claim.ClaimMode = 'Pending';
    claim.ClaimDetails1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru';
    claim.ClaimDetails2 = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem ';
    claim.ClaimPremiumStatus = 'Paid';
    claim.ClaimActionRequired = 'Yes';
  
    const today = setupDemo.timestamp;
    today.setDate(today.getDate());
    claim.ClaimCreateDate = today;
  
    const lossDate = new Date();
    lossDate.setDate(today.getDate() + 12);
    claim.ClaimDateofLoss = lossDate;
  
    claim.PolicyNo = factory.newRelationship(NS, AST_POLICY, 'CCR K0001FR0020185');
    claim.owner = factory.newRelationship(NS, PRTCP_PARTY, 'Isabelle');
  
    //Add claim to registry
    const claimRegistry = await getAssetRegistry(NS_CLAIM);
    await claimRegistry.addAll([claim]);
    */
}
