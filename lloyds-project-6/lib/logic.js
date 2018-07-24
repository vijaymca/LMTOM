/**
 * CreateClaim Transaction
 * @param {org.lloyds.model.CreateClaim} CreateClaim
 * @transaction
 * 
 */

function    createclaim(claimData) {
      return getAssetRegistry('org.lloyds.market.Claim')
      
          .then(function(ClaimRegistry){
              // Now add the claim - global function getFactory() called
              var  factory = getFactory();
  
              var  NS =  'org.lloyds.model.CreateClaim';
  
              // Solution to exercise - Removed hardcoded value & invoked
              // generate the claim ID
              // 2.1 Set the claimNumber, claimId ... 
        
        
              
              var  claim = factory.newResource('org.lloyds.market','Claim',claimData.ClaimNo);
              
                    claim.ClaimCreatedBy = claimData.ClaimCreatedBy;
                    claim.ClaimMode = claimData.ClaimMode;
              claim.ClaimDetails1 = claimData.ClaimDetails1;
              claim.ClaimDetails2 = claimData.ClaimDetails2;
              claim.ClaimPremiumStatus = claimData.ClaimPremiumStatus;
              claim.ClaimActionRequired = claimData.ClaimActionRequired;
        
              claim.ClaimCreateDate = claimData.ClaimCreateDate;
              claim.ClaimDateofLoss = claimData.ClaimDateofLoss;
                    claim.ClaimTargetDate = claimData.ClaimTargetDate;
        
                    let policy = factory.newRelationship('org.lloyds.market', 'Policy', claimData.PolicyNo);
              claim.PolicyNo = policy;
   
              let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.owner);
              claim.owner = _Party;
                    
                    if (claimData.LeadCarrier){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.LeadCarrier);
              claim.LeadCarrier = _Party;
                    }		
                    if (claimData.PlacingBroker){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.PlacingBroker);
              claim.PlacingBroker = _Party;
                    }	
                    if (claimData.ClaimsBroker){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.ClaimsBroker);
              claim.ClaimsBroker = _Party;
                    }		
                    if (claimData.OverseasBroker){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.OverseasBroker);
              claim.OverseasBroker = _Party;
                    }	
                    if (claimData.PolicyOwner){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.PolicyOwner);
              claim.PolicyOwner = _Party;
                    }		
                    if (claimData.Followers1){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers1);
              claim.Followers1 = _Party;
                    }	
                    if (claimData.Followers2){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers2);
              claim.Followers2 = _Party;
                    }		
                    if (claimData.Followers3){
                    let _Party = factory.newRelationship('org.lloyds.market', '_Party', claimData.Followers3);
              claim.Followers3 = _Party;
                    }
                    if (claimData.Followers4){
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
  
  