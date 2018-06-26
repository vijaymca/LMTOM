'use strict';

const bnc = require('composer-client').BusinessNetworkConnection;
const cardName = 'admin@lloyds-project-5';
const connection = new bnc();

module.exports = function(app) {

app.get('/',function(req,res){
	res.end("Welcome to Lloyds Market DLT services");
});

app.get('/Claims', function(req, res) {
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;
    console.log("********* Claims")
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT org.lloyds.market.Claim';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry);
        }).then((results1)=>{
            connection.disconnect();             
        
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT org.lloyds.market.Policy ';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry);
            }).then((results2)=>{
             connection.disconnect(); 

             for (var i = 0; i < results1.length; i++){
                var obj = results1[i];
                console.log("*********");
                console.log(obj.PolicyNo.$identifier)
                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                var policy_obj = policyResult[0]
                console.log(policy_obj.PolicyNo)
                    {
                        jsonObj.push({ 
							"ClaimNo" : obj.ClaimNo,
							"InsuredCompanyName" : policy_obj.InsuredCompanyName,
                            "PolicyNo" : policy_obj.PolicyNo,
							"Day" : obj.ClaimCreateDate.toString(),
							
							"MovementDate": policy_obj.PolicyEffectiveDate,
							                           
                        });                
                    }
                }

            console.log("*************************")
            for (var i = 0; i < jsonObj.length; i++){
                    var obj = jsonObj[i];
                    for (var key in obj){
                        if (key == "Day") {
                            var attrValue = obj[key];
                            var d = new Date(attrValue);
                            jsonObj[i][key] = timeSince(d)
                            console.log(timeSince(d))
                        }
                    }
                }			
            res.json({jsonObj });
        });
    });
});

app.get('/ClaimDetails/:ClaimNumber', function(req, res) {
    console.log("*********  ClaimDetails "+req.params.ClaimNumber);
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;

    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:req.params.ClaimNumber});
        }).then((results1)=>{
            claim_obj = results1[0]
            console.log(claim_obj.PolicyNo.$identifier)
            connection.disconnect();             
        
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:claim_obj.PolicyNo.$identifier});
            }).then((results2)=>{
             policy_obj = results2[0]
             connection.disconnect(); 

            jsonObj.push({ 
                "ClaimNo" : claim_obj.ClaimNo,
                "PolicyNo" : claim_obj.PolicyNo.$identifier,
                "InsuredCompanyName" : policy_obj.InsuredCompanyName,


                "PolicyType" : policy_obj.PolicyType,
                "PolicyEffectiveDate" : policy_obj.PolicyEffectiveDate,
                "PolicyExpiryDate" : policy_obj.PolicyExpiryDate,
                "ClaimDateofLoss" : claim_obj.ClaimDateofLoss,
                "ClaimActionRequired" : claim_obj.ClaimActionRequired,
              
            }); 
            console.log("*************************")
            console.log(jsonObj)
            res.json({jsonObj });

            });
             
});
});


app.get('/ClaimInvestigate/:ClaimNumber', function(req, res) {
    console.log("*********  ClaimInvestigate "+req.params.ClaimNumber);
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;

    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:req.params.ClaimNumber});
        }).then((results1)=>{
            claim_obj = results1[0]
            console.log(claim_obj.PolicyNo.$identifier)
            connection.disconnect();             
        
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:claim_obj.PolicyNo.$identifier});
            }).then((results2)=>{
             policy_obj = results2[0]
             connection.disconnect(); 

            jsonObj.push({ 
                "ClaimNo" : claim_obj.ClaimNo,
                "PolicyNo" : claim_obj.PolicyNo.$identifier,
                "InsuredCompanyName" : policy_obj.InsuredCompanyName,


                "PolicyType" : policy_obj.PolicyType,
                "PolicyEffectiveDate" : policy_obj.PolicyEffectiveDate,
                "PolicyExpiryDate" : policy_obj.PolicyExpiryDate,
                "ClaimDateofLoss" : claim_obj.ClaimDateofLoss,
                "ClaimActionRequired" : claim_obj.ClaimActionRequired,

                "ClaimDetails1" : claim_obj.ClaimDetails1,
                "ClaimDetails2" : claim_obj.ClaimDetails2,
                "ClaimNotes" : claim_obj.ClaimNotes,
                "PolicyDetails1" : policy_obj.PolicyDetails1,
              
            }); 
            console.log("*************************")
            console.log(jsonObj)
            res.json({jsonObj });

            });
             
});
});


app.get('/ClaimHistory', function(req, res) {
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;
    console.log("********* getClaimHistory")
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT org.lloyds.market.Claim';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry);
        }).then((results1)=>{
            connection.disconnect();             
        
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT org.lloyds.market.Policy ';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry);
            }).then((results2)=>{
             connection.disconnect(); 

             for (var i = 0; i < results1.length; i++){
                var obj = results1[i];
                console.log("*********");
                console.log(obj.PolicyNo.$identifier)
                var policyResult = (results2.filter(item => item.PolicyNo === obj.PolicyNo.$identifier.toString()));
                var policy_obj = policyResult[0]
                console.log(policy_obj.PolicyNo)
                    {
                        jsonObj.push({ 
                            "PolicyNo" : policy_obj.PolicyNo,
                            "InsuredCompanyName" : policy_obj.InsuredCompanyName,

                            "PolicyType" : policy_obj.PolicyType,
                            "PolicyEffectiveDate" : policy_obj.PolicyEffectiveDate,
                            "PolicyExpiryDate" : policy_obj.PolicyExpiryDate,

                            "ClaimPremiumStatus" : obj.ClaimPremiumStatus,
                            "ClaimActionRequired" : obj.ClaimActionRequired,
                            "ClaimUpdateDate" : obj.ClaimUpdateDate,
                            "ClaimMode" : obj.ClaimMode,
                            "ClaimNo" : obj.ClaimNo,
                        });                
                    }
                }

            console.log("*************************")
            res.json({jsonObj });
        });
    });
});


app.get('/ClaimHistory/:ClaimNumber', function(req, res) {
    console.log("*********  ClaimInvestigate "+req.params.ClaimNumber);
    var jsonObj = [];
    var results1;
    var results2;
    var claim_obj;
    var policy_obj;
    console.log("********* getClaimHistory")
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Claim WHERE (ClaimNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:req.params.ClaimNumber});
        }).then((results1)=>{
            claim_obj = results1[0]
            console.log(claim_obj.PolicyNo.$identifier)
            connection.disconnect();             
        
    return connection.connect(cardName).then(function(){
        var   statement = 'SELECT  org.lloyds.market.Policy WHERE (PolicyNo == _$id)';
        return connection.buildQuery(statement);
        }).then((qry)=>{
            return connection.query(qry,{id:claim_obj.PolicyNo.$identifier});
            }).then((results2)=>{
             policy_obj = results2[0]
             connection.disconnect(); 
             console.log(policy_obj.PolicyNo)
            {
                jsonObj.push({ 
                            "PolicyNo" : policy_obj.PolicyNo,
                            "InsuredCompanyName" : policy_obj.InsuredCompanyName,

                            "PolicyType" : policy_obj.PolicyType,
                            "PolicyEffectiveDate" : policy_obj.PolicyEffectiveDate,
                            "PolicyExpiryDate" : policy_obj.PolicyExpiryDate,

                            "ClaimPremiumStatus" : claim_obj.ClaimPremiumStatus,
                            "ClaimActionRequired" : claim_obj.ClaimActionRequired,
                            "ClaimUpdateDate" : claim_obj.ClaimUpdateDate,
                            "ClaimMode" : claim_obj.ClaimMode,
                            "ClaimNo" : claim_obj.ClaimNo,
                });                
            }


            console.log("*************************")
            res.json({jsonObj });
        });
    });
});


app.post('/login', function(req, res) {
    console.log("*********  login "+req.params.ClaimNumber);
    var request = require('request');
    
    var user_id = req.body.id;
    var password = req.body.password;

    console.log("*********  user_id "+user_id);
    console.log("*********  password "+password);


    request.get("http://localhost:3000/auth/github", (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        console.log("*********  body "+body);
        //console.dir(JSON.parse(body));
    });
    res.send('POST request to the homepage')
});
    
    

};





function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = Math.floor(seconds / 31536000);
  
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }