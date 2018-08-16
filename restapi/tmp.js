var js2xmlparser = require("js2xmlparser");
var jsonObj = [];

jsonObj.push(
        {
            "PolicyNo": "",
            "InsuredCompanyName": "",
            "InsuredMailingAddress": {
                "class": "org.lloyds.market._Address",
                "NumberAndStreet": "21321",
                "CityName": "1231",
                "PostalCode": "1231",
                "Country": "1231"
            },
            "BrokerPlacing": {
                "class": "org.lloyds.market._Address",
                "NumberAndStreet": "",
                "CityName": "sdas",
                "PostalCode": "adsas",
                "Country": "adsasd"
            },
            "BrokerOverSeas": {
                "class": "org.lloyds.market._Address",
                "NumberAndStreet": "",
                "CityName": "sdas",
                "PostalCode": "adsas",
                "Country": "adsasd"
            },
            "TotalSumInsured": {
                "class": "org.lloyds.market._insuredAmount",
                "property_damage": 520200000,
                "busi_interupt": 13200000
            },
            "FinancialOverview": [
                {
                    "class": "org.lloyds.market._Premium",
                    "PremiumType": "Fugiat.",
                    "PremiumAmount": 135000,
                    "PaymentDate": "Est duis.",
                    "TermsOfTradePeriod": "Minim cupidatat.",
                    "PaymentsDescription": "Sunt in aliqua.",
                    "placeBrokerComm": 0.09,
                    "overseasBroComm": 0.11,
                    "premiumBeenPaiByPolHolder": false,
                    "reinstatementApplicable": false,
                    "reinstatementPaidByPolHolder": false
                }
            ],
            "polLayerinfo": {
                "layer": "Primary",
                "limit": {
                    "for": "40000000",
                    "per": "50000"
                },
                "deductable": "50000",
                "PD": 520200000,
                "BI": 13200000,
                "coverage": "Property(PD&BI)",
                "brokarage": "20",
                "premium": "135000"
            },
            "ContractPeriod": {
                "class": "org.lloyds.market._ContractPeriod",
                "StartDateTime": "2018-08-03T13:39:58.633Z",
                "EndDateTime": "2018-08-03T13:39:58.633Z"
            },
            "Followers": [
                {
                    "class": "org.lloyds.market._follower",
                    "index": "Est.",
                    "party": "resource:org.lloyds.market._Party#6418",
                    "written": 36184,
                    "signed": 57121
                }
            ],
            "Sublimits": {
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
            "CarrierInfo": [
                {
                    "class": "org.lloyds.market.carrierInfo",
                    "LineNo": "Culpa elit nisi incididunt.",
                    "PostalCode": "Id est laboris officia.",
                    "bindingVal": 383985000,
                    "constMach": 120000,
                    "BI_monthip": 12000000,
                    "sectionA": 1,
                    "premium": 31236,
                    "cntry_tax": 12
                }
            ]
        }
    
)


function rename (obj) {
    for(var prop in obj) {
  
      if (Array.isArray(obj[prop])) {
          obj[prop] = obj[prop].map(rename);
      }
  
      if (prop === 'Departments') {
        obj.children = obj[prop];
        delete obj[prop];
      }
    }
  
      return obj;
  };
  
//console.log(jsonObj)


console.log(js2xmlparser.parse("policy", jsonObj));