fs.stat(filePath, function (err, stats) {
    //console.log(stats);//here we got all information of file in stats variable
 
    if (err) {
        return console.error(err);
    }
 
    fs.unlink(filePath,function(err){
         if(err) return console.log(err);
         console.log('file deleted successfully');
    });  
 });



 var filePath = "/tmp/".concat(str1).concat(".xml");