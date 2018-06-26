
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


/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.lloyds.market.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */

async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'org.lloyds.market';

    //Create Policy
    const policy = factory.newResource(NS,'Policy','CCR Y0001PR0027869');
    policy.InsuredCompanyName ='James Bowling Estates';
    policy.PolicyType ='Commercial Prop';
    policy.PolicyDetails1='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur';
    policy.LeadCarrier = 'Fortitude (FRT 2100)';
    policy.PlacingBroker = 'WideWorld Broking limited';
    policy.ClaimsBroker = 'Lloyds Claim Broker';
    policy.OverseasBroker = 'Cornish Coverage';
    policy.Followers = ["Dakota (DKT 7809)", "Bleachers Re (BRE 3290)", "Towers Inc (TWR 2244)"];
    
    const effectiveDate = setupDemo.timestamp;
    effectiveDate.setDate(effectiveDate.getDate());
    policy.PolicyEffectiveDate = effectiveDate;
  
  	const expiryDate = new Date();
  	expiryDate.setDate(effectiveDate.getDate() + 10);
  
    policy.PolicyExpiryDate= expiryDate;

    // add the Policy
    const policyRegistry = await getAssetRegistry(NS + '.Policy');
    await policyRegistry.addAll([policy]);


    //Create Claim
    const claim = factory.newResource(NS,'Claim','678XZ76502');
    claim.ClaimCreatedBy = 'Fortitude (FRT 2100)';
    claim.ClaimMode = 'Pending';
    claim.ClaimDetails1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru';
    claim.ClaimDetails2 = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem ';
    claim.ClaimPremiumStatus = 'Paid';
    claim.ClaimActionRequired = 'Yes';
    
    const today = setupDemo.timestamp;
    claim.ClaimCreateDate = today.getDate();

    const lossDate = new Date();
    lossDate.setDate(today.getDate() + 12);

    claim.ClaimDateofLoss = '';
    claim.PolicyNo = factory.newRelationship(NS, 'Policy', 'CCR Y0001PR0027869');

    const claimRegistry = await getAssetRegistry(NS + '.Policy');
    await claimRegistry.addAll([claim]);
}
