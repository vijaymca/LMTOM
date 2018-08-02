// console.log(timeDifference(new Date("2018-08-01T09:03:42.115Z")))

// var hours = Math.abs(date - new Date()).toFixed() / 36e5;

// return hours.toFixed();




console.log((new Date("2018-08-01T09:03:42.115Z")))


console.log(formatDate(new Date("2018-12-17T09:03:42.115Z")))


function formatDate(dateVal) {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);

    if (iHourCheck > 12) {
        sAMPM = "PM";
        sHour = iHourCheck - 12;
    }
    else if (iHourCheck === 0) {
        sHour = "12";
    }

    sHour = padValue(sHour);

    return sMonth + "-" + sDay + "-" + sYear + " " + sHour + ":" + sMinute + " " + sAMPM;
}

function padValue(value) {
    return (value < 10) ? "0" + value : value;
}



// console.log((new Date("2018-08-01T09:03:42.115Z")))


// var newDate = new Date(Date.now() + 1*24*60*60*1000);

// console.log(newDate)





// function timeDifference(date) {


//     var hours = Math.abs(date - new Date()).toFixed() / 36e5;

//     return hours.toFixed();

//     // //        console.log(date > new Date())
//     // if (date < new Date()) {
//     //     var seconds = Math.floor((new Date() - date) / 1000);
//     // } else {
//     //     var seconds = Math.floor((date - new Date()) / 1000);
//     // }

//     // //console.log(seconds)
//     // var interval = Math.floor(seconds / 31536000);


//     // if (interval > 1) {
//     //     return interval + " years";
//     // }
//     // interval = Math.floor(seconds / 2592000);
//     // if (interval > 1) {
//     //     return interval + " months";
//     // }
//     // interval = Math.floor(seconds / 86400);
//     // if (interval > 1) {
//     //     return interval + " days";
//     // }
//     // interval = Math.floor(seconds / 3600);
//     // if (interval > 1) {
//     //     return interval + " hours";
//     // }
//     // interval = Math.floor(seconds / 60);
//     // if (interval > 1) {
//     //     return interval + " minutes";
//     // }
//     // return Math.floor(seconds) + " seconds";
// }