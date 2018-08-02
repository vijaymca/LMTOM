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
 * @param {org.lloyds.model.policyNew} policyNew 
 * @transaction
 */

async function policyNew(xData) { // eslint-disable-line no-unused-vars
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
* Initialize some test assets and participants useful for running a demo.
* @param {org.lloyds.model.updatePolicy} updatePolicy 
* @transaction
*/

async function updatePolicy(xData) {
    const policy = await claimRegistry.get(xData.claimId);

    const policyRegistry = await getAssetRegistry(NS_POLICY);
    await policyRegistry.update(policy);
}

/**
 * CreateClaim Transaction
 * @param {org.lloyds.model.CreateClaim} CreateClaim
 * @transaction
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
                  claim.ClaimMode = "ConflictofInterest";
                  claim.ClaimDetails1 = claimData.ClaimDetails1;
                  claim.ClaimDetails2 = claimData.ClaimDetails2;
                  claim.ClaimPremiumStatus = claimData.ClaimPremiumStatus;
                  claim.ClaimActionRequired = claimData.ClaimActionRequired;

                  claim.ClaimCreateDate = claimData.ClaimCreateDate;
                  claim.ClaimDateofLoss = claimData.ClaimDateofLoss;
                  claim.ClaimTargetDate = claimData.ClaimTargetDate;
                  claim.ClaimEstimateLoss = claimData.ClaimEstimateLoss;
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


/** TransactionUpdateClaimMode Transaction
 * @param {org.lloyds.model.TransactionUpdateClaimMode} TransactionUpdateClaimMode
 * @transaction
 */
async function TransactionUpdateClaimMode(xData) {
      var NS = 'org.lloyds.model.TransactionUpdateClaimMode';

      var factory = getFactory();

      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);
      claim.ClaimMode = xData.ClaimMode;
      await claimRegistry.update(claim);

      // 3 Emit the event EventUpdateClaimMode
      var event = factory.newEvent('org.lloyds.model', 'EventUpdateClaimMode');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimMode = claim.ClaimMode;
      emit(event);
}



/** TransactionClaimSettlementAmount Transaction
 * @param {org.lloyds.model.TransactionClaimSettlementAmount} TransactionClaimSettlementAmount
 * @transaction
 */
async function TransactionClaimSettlementAmount(xData) {
      var NS = 'org.lloyds.model.ClaimSettlementAmount';

      var factory = getFactory();
      let SettlementAmount = await factory.newConcept('org.lloyds.market', '_ClaimSettlementAmount');

      SettlementAmount.Amount = xData.Amount;
      SettlementAmount.Status = xData.Status;

      SettlementAmount.CreateDate = xData.CreateDate;
      SettlementAmount.TargetDate = xData.TargetDate;

      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);
      claim.ClaimSettlementAmount = SettlementAmount;

      
      await claimRegistry.update(claim);

      // 3 Emit the event ClaimSettlementAmountUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimSettlementAmountUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimSettlementAmount = claim.ClaimSettlementAmount;
      emit(event);
}


/** TransactionClaimSettlementAmountStatus Transaction
 * @param {org.lloyds.model.TransactionClaimSettlementAmountStatus} TransactionClaimSettlementAmountStatus
 * @transaction
 */
async function TransactionClaimSettlementAmountStatus(xData) {
      var NS = 'org.lloyds.model.TransactionClaimSettlementAmountStatus';

      var factory = getFactory();

      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);
      claim.ClaimSettlementAmount.Status = xData.Status;

      claim.ClaimMode = "PremiumCheck";
      await claimRegistry.update(claim);

      // 3 Emit the event ClaimSettlementAmountUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimSettlementAmountUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimSettlementAmount = claim.ClaimSettlementAmount;
      emit(event);
}


/** TransactionClaimExpertOpinion Transaction
 * @param {org.lloyds.model.TransactionClaimExpertOpinion} TransactionClaimExpertOpinion
 * @transaction
 */
async function TransactionClaimExpertOpinion(xData) {
      var NS = 'org.lloyds.model.ClaimExpertOpinion';

      var factory = getFactory();
      let ExpertOpinion = await factory.newConcept('org.lloyds.market', '_ClaimExpertOpinion');

      ExpertOpinion.ClaimExpertOpinion = xData.ClaimExpertOpinion;
      ExpertOpinion.Status = xData.Status;


      ExpertOpinion.CreateDate = xData.CreateDate;
      ExpertOpinion.TargetDate = xData.TargetDate;
      ExpertOpinion.Status = xData.Status;

      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);

      claim.ClaimExpertOpinion = ExpertOpinion;
      await claimRegistry.update(claim);

      // 3 Emit the event ClaimSettlementAmountUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimExpertOpinionUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimExpertOpinion = claim.ClaimExpertOpinion;
      emit(event);
}

/** TransactionClaimExpertOpinionStatus Transaction
 * @param {org.lloyds.model.TransactionClaimExpertOpinionStatus} TransactionClaimExpertOpinionStatus
 * @transaction
 */
async function TransactionClaimExpertOpinionStatus(xData) {
      var NS = 'org.lloyds.model.TransactionClaimExpertOpinionStatus';

      var factory = getFactory();
      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);

      claim.ClaimExpertOpinion.Status = xData.Status;

      await claimRegistry.update(claim);

      // 3 Emit the event ClaimSettlementAmountUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimExpertOpinionUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimExpertOpinion = claim.ClaimExpertOpinion;
      emit(event);
}


/** TransactionClaimQuery Transaction
 * @param {org.lloyds.model.TransactionClaimQuery} TransactionClaimQuery
 * @transaction
 */
async function TransactionClaimQuery(xData) {
      var NS = 'org.lloyds.model.TransactionClaimQuery';

      var factory = getFactory();
      let ClaimQuery = await factory.newConcept('org.lloyds.market', '_ClaimQuery');

      ClaimQuery.ClaimQuery = xData.ClaimQuery;
      ClaimQuery.Status = xData.Status;


      ClaimQuery.CreateDate = xData.CreateDate;
      ClaimQuery.TargetDate = xData.TargetDate;
      ClaimQuery.Status = xData.Status;

      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);

      claim.ClaimQuery = ClaimQuery;
      await claimRegistry.update(claim);

      // 3 Emit the event ClaimSettlementAmountUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimQueryUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimQuery = claim.ClaimQuery;
      emit(event);
}

/** TransactionClaimQueryStatus Transaction
 * @param {org.lloyds.model.TransactionClaimQueryStatus} TransactionClaimQueryStatus
 * @transaction
 */
async function TransactionClaimQueryStatus(xData) {
      var NS = 'org.lloyds.model.TransactionClaimQueryStatus';

      var factory = getFactory();
      const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
      const claim = await claimRegistry.get(xData.claimId);

      claim.ClaimQuery.Status = xData.Status;

      await claimRegistry.update(claim);

      // 3 Emit the event ClaimQueryUpdated
      var event = factory.newEvent('org.lloyds.model', 'ClaimQueryUpdated');
      event.ClaimNo = xData.claimId;

      event.ClaimDateofLoss = claim.ClaimDateofLoss;
      event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
      event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
      event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
      event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
      event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
      event.Followers1 = claim.Followers1.$identifier.toString();
      event.Followers2 = claim.Followers2.$identifier.toString();
      event.Followers3 = claim.Followers3.$identifier.toString();
      event.Followers4 = claim.Followers4.$identifier.toString();
      event.ClaimQuery = claim.ClaimQuery;

      emit(event);
}


/** * claimConflict Transaction
 * @param {org.lloyds.model.claimConflict} claimConflict
 * @transaction
 */
async function claimConflict(xData) {
      // Update claim
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      const claim = await claimRegistry.get(xData.claimId);
      claim.owner = xData.owner;
      claim.LeadCarrier = xData.LeadCarrier;
      claim.comments.push(comment);

      claim.ClaimMode = "ClaimEvaluation";
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
      
      claim.ClaimMode = "HousekeepingCheck";
      await claimRegistry.update(claim);
}

/** claimSegment Transaction
 * @param {org.lloyds.model.claimSegment} claimSegment
 * @transaction
 */
async function claimSegment(xData) {
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      const claim = await claimRegistry.get(xData.claimId);
      claim.segmnt = xData.segmnt;
      
      claim.ClaimMode = "ClaimSettlement";
      await claimRegistry.update(claim);
}

/** housekeep Transaction
 * @param {org.lloyds.model.housekeep} housekeep
 * @transaction
 */
async function housekeep(xData) {
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      const claim = await claimRegistry.get(xData.claimId);
      claim.houseKeeping = xData.housekeep;
      
      claim.ClaimMode = "Closed";
      await claimRegistry.update(claim);
}

/** AdditionalInfo Transaction
 * @param {org.lloyds.model.claimAddtionalInfo} claimAddtionalInfo
 * @transaction
 */
async function claimAddtionalInfo(xData) {
      let claim = xData.claim;
      var factory = getFactory();
      if (!claim.additionalInfo) {
            claim.additionalInfo = [];
      }

      claim.additionalInfo.push(xData);
      const claimRegistry = await getAssetRegistry(NS_CLAIM);
      await claimRegistry.update(claim);
}


/** ClaimSettlementAmount Transaction
 * @param {org.lloyds.model.ClaimSettlementAmount} ClaimSettlementAmount
 * @transaction
 */
async function ClaimSettlementAmount(xData) {
    var NS = 'org.lloyds.model.ClaimSettlementAmount';

    var factory = getFactory();
    let SettlementAmount = await factory.newConcept('org.lloyds.market', '_ClaimSettlementAmount');
    SettlementAmount.ClaimSettlementAmount = xData.ClaimSettlementAmount;
    SettlementAmount.ClaimSettlementAmountDate = new Date();

    const claimRegistry = await getAssetRegistry('org.lloyds.market.Claim');
    const claim = await claimRegistry.get(xData.claimId);
    claim.ClaimSettlementAmount = SettlementAmount;
    await claimRegistry.update(claim);

    // 3 Emit the event ClaimSettlementAmountUpdated
    var event = factory.newEvent('org.lloyds.model', 'ClaimSettlementAmountUpdated');
    event.ClaimNo = xData.claimId;

    event.ClaimDateofLoss = claim.ClaimDateofLoss;
    event.LeadCarrier = claim.LeadCarrier.$identifier.toString();
    event.PlacingBroker = claim.PlacingBroker.$identifier.toString();
    event.ClaimsBroker = claim.ClaimsBroker.$identifier.toString();
    event.OverseasBroker = claim.OverseasBroker.$identifier.toString();
    event.PolicyOwner = claim.PolicyOwner.$identifier.toString();
    event.Followers1 = claim.Followers1.$identifier.toString();
    event.Followers2 = claim.Followers2.$identifier.toString();
    event.Followers3 = claim.Followers3.$identifier.toString();
    event.Followers4 = claim.Followers4.$identifier.toString();
    event.ClaimSettlementAmount = claim.ClaimSettlementAmount;
    emit(event);
}