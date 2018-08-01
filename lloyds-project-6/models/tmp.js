/**
 * New model file
 */

namespace org.lloyds.model
import org.lloyds.market.Policy
import org.lloyds.market._Party
import org.lloyds.market.Claim
import org.lloyds.market._ClaimSettlementAmount
import org.lloyds.market._ClaimExpertOpinion
import org.lloyds.market._ClaimQuery


transaction CreateClaim{
    o   String    ClaimNo
    o   String    ClaimCreatedBy
    o   String    ClaimMode default="Pending"
    o   String   	ClaimDetails1 default="Lorem ipsum dolor sit amet"
    o   String    ClaimDetails2 default="consectetur adipiscing elit"
    o   String    ClaimPremiumStatus default="Paid"
    o   String    ClaimActionRequired default="Yes"
    o   DateTime  ClaimCreateDate
    o   DateTime  ClaimDateofLoss
    o   DateTime  ClaimTargetDate

    o   String    PolicyNo
    o   String    owner default="admin"

    o   String    LeadCarrier default="admin"
    o   String    PlacingBroker default="admin"
    o   String    ClaimsBroker default="admin"
    o   String    OverseasBroker default="admin"
    o   String    PolicyOwner default="admin"
    o   String    Followers1 default="admin"
    o   String    Followers2 default="admin"
    o   String    Followers3 default="admin"
    o   String    Followers4 default="admin"

}

event CreateClaimCreated {
    o   String    PolicyNo
    o   String    ClaimNo
    o   DateTime  ClaimDateofLoss
    o   String    LeadCarrier
    o   String    PlacingBroker
    o   String    ClaimsBroker
    o   String    OverseasBroker
    o   String    PolicyOwner
    o   String    Followers1
    o   String    Followers2
    o   String    Followers3
    o   String    Followers4


}

// To check ClaimSettlementAmount
transaction TransactionClaimSettlementAmount {
    o String claimId
    o String Amount
    o String Status default="Pending"
    o DateTime CreateDate
    o DateTime TargetDate
}

// To check ClaimSettlementAmount Status
transaction TransactionClaimSettlementAmountStatus {
    o String claimId
    o String Status
}


event ClaimSettlementAmountUpdated {

    o   String    ClaimNo
    o   DateTime  ClaimDateofLoss
    o   String    LeadCarrier
    o   String    PlacingBroker
    o   String    ClaimsBroker
    o   String    OverseasBroker
    o   String    PolicyOwner
    o   String    Followers1
    o   String    Followers2
    o   String    Followers3
    o   String    Followers4
    o _ClaimSettlementAmount ClaimSettlementAmount

}

// To check ClaimExpertOpinion
transaction TransactionClaimExpertOpinion {
    o String claimId
    o String ClaimExpertOpinion
    o DateTime CreateDate
    o DateTime TargetDate
    o String Status default="Pending"
}

// To check ClaimExpertOpinion Status
transaction TransactionClaimExpertOpinionStatus {
    o String claimId
    o String Status
}

event ClaimExpertOpinionUpdated {

    o   String    ClaimNo
    o   DateTime  ClaimDateofLoss
    o   String    LeadCarrier
    o   String    PlacingBroker
    o   String    ClaimsBroker
    o   String    OverseasBroker
    o   String    PolicyOwner
    o   String    Followers1
    o   String    Followers2
    o   String    Followers3
    o   String    Followers4
    o  _ClaimExpertOpinion ClaimExpertOpinion

}



// To check ClaimQuery
transaction TransactionClaimQuery {
    o String claimId
    o String ClaimQuery
    o DateTime CreateDate
    o DateTime TargetDate
    o String Status default="Pending"
}

// To check ClaimSettlemeClaimQueryntAmount Status
transaction TransactionClaimQueryStatus {
    o String claimId
    o String Status
}

event ClaimQueryUpdated {

    o   String    ClaimNo
    o   DateTime  ClaimDateofLoss
    o   String    LeadCarrier
    o   String    PlacingBroker
    o   String    ClaimsBroker
    o   String    OverseasBroker
    o   String    PolicyOwner
    o   String    Followers1
    o   String    Followers2
    o   String    Followers3
    o   String    Followers4
    o  _ClaimQuery ClaimQuery

}



// To check ClaimMode 
transaction TransactionUpdateClaimMode {
    o String claimId
    o String ClaimMode
}

// ClaimMode  Event
event EventUpdateClaimMode  {
    o   String    ClaimNo
    o   DateTime  ClaimDateofLoss
    o   String    LeadCarrier
    o   String    PlacingBroker
    o   String    ClaimsBroker
    o   String    OverseasBroker
    o   String    PolicyOwner
    o   String    Followers1
    o   String    Followers2
    o   String    Followers3
    o   String    Followers4
    o   String    ClaimMode

}   
