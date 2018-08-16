var js2xmlparser = require("js2xmlparser");
var jsonObj = [];

jsonObj.push(

    {
        "class": "org.lloyds.market.Policy",
        "PolicyNo": "UMR B0001PR0020188",
        "InsuredCompanyName": "Southern Medical Centre",
        "PolicyType": "CommercialProp",
        "PolicyDetails1": "https://s3-eu-west-1.amazonaws.com/lloyds-project/policy/B0001PR0020184_policy.pdf",
        "PolicyEffectiveDate": "2018-01-01T09:03:42.115Z",
        "PolicyExpiryDate": "2018-12-31T09:03:42.115Z",
        "PolicyStatus": "ReviewInformation",
        "UUId": "",
        "ServiceProviderReference": "",
        "CreationDate": "2018-08-07T09:50:34.348Z",
        "SentDate": "2018-08-07T09:50:34.348Z",
        "ContractVersionDate": "2018-08-07T09:50:34.348Z",
        "PlacingStage": "",
        "PlacingTransactionFunction": "",
        "PlacingEntry": "",
        "TransactionReasonDescription": "",
        "InsuredDescription": "",
        "Insurer": "resource:org.lloyds.market._Party#Fortitude",
        "Broker": "resource:org.lloyds.market._Party#Isabelle",
        "ServiceProvider": "resource:org.lloyds.market._Party#DanielBryan",
        "Insured": "resource:org.lloyds.market._Party#JohnGrey",
        "ProducingBroker": "resource:org.lloyds.market._Party#Isabelle",
        "LeadCarrier": "resource:org.lloyds.market._Party#TowersInc",
        "PlacingBroker": "resource:org.lloyds.market._Party#DavidC",
        "ClaimsBroker": "resource:org.lloyds.market._Party#GaingKim",
        "OverseasBroker": "resource:org.lloyds.market._Party#GaingKim",
        "Followers1": "resource:org.lloyds.market._Party#SymphonInsurance",
        "Followers2": "resource:org.lloyds.market._Party#BleachersRe",
        "Followers3": "resource:org.lloyds.market._Party#DanielBryan",
        "Followers4": "resource:org.lloyds.market._Party#CapeSolUnderwriting",
        "ContractPeriod": {
          "class": "org.lloyds.market._ContractPeriod",
          "StartDateTime": "2018-08-09T09:50:34.348Z",
          "EndDateTime": "2018-12-07T09:50:34.348Z"
        },
        "Contract": {
          "class": "org.lloyds.market._Contract",
          "ContractType": "",
          "BrokerReference": ""
        },
        "sublimits": {
          "class": "org.lloyds.market._sublimits",
          "construction": 50000000,
          "debris_removal": 35000000,
          "named_strom": 100000000,
          "earth_movement": 100000000,
          "exp_costs_and_ext_expense": 50000000,
          "flood": 100000000,
          "neighbous_recourse_tenants_liablt": 50000000,
          "professional_fees": 2000000
        },
        "insuranceAmount": {
          "class": "org.lloyds.market._insuredAmount",
          "property_damage": 520200000,
          "busi_interupt": 13200000
        },
        "premium": [
          {
            "class": "org.lloyds.market._Premium",
            "PremiumAmount": 12345,
            "placeBrokerComm": 5.56860534420864e+50,
            "overseasBroComm": 0.11,
            "premiumBeenPaiByPolHolder": false,
            "reinstatementApplicable": false,
            "reinstatementPaidByPolHolder": false
          },
          {
            "class": "org.lloyds.market._Premium",
            "PremiumAmount": 1700045,
            "placeBrokerComm": 1.06751060294102e+55,
            "overseasBroComm": 0.11,
            "premiumBeenPaiByPolHolder": false,
            "reinstatementApplicable": false,
            "reinstatementPaidByPolHolder": false
          }
        ],
        "followers": [
          {
            "class": "org.lloyds.market._follower",
            "index": "0",
            "party": "resource:org.lloyds.market._Party#Isabelle",
            "CompanyName": "Bleachers Re (BRE 3290)"
          },
          {
            "class": "org.lloyds.market._follower",
            "index": "1",
            "party": "resource:org.lloyds.market._Party#Fortitude",
            "CompanyName": "Fortitude (FRT 2100)"
          }
        ],
        "carrierInfo": [
          {
            "class": "org.lloyds.market.carrierInfo",
            "LineNo": "1-2/3",
            "PostalCode": "500053",
            "bindingVal": 324323423,
            "constMach": 120000,
            "BI_monthip": 21000,
            "sectionA": 1,
            "premium": 3122,
            "cntry_tax": 12
          }
        ]
      }

)

function sanitize (obj) {

      delete obj['class'];
      delete obj['checkPremium']['class'];
      delete obj['houseKeeping']['class'];
      delete obj['segmnt']['class'];
      delete obj['ClaimSettlementAmount']['class'];
      return obj;
    }
  
      


//console.log(rename(jsonObj[0]))


console.log(js2xmlparser.parse("policy", sanitize(jsonObj[0])));