"use strict"
/**
Topological dependency

1. Pay first 
2. If Pay succeeded (in no particular order):
   o Save pay information
   o Email pay information
   o generate Ticked with pay information
 **/

/*
function pay(req, res, cb){
    var stime = Math.random() * 2000;
    console.log("Pay is taking " + stime + " ms");
    setTimeout( function(){ 
	    if (cb) cb(req, res);
	    console.log("Pay is finished");
	}, stime);
}
*/
function makeFunc(name){
    return function(req, res, cb){
	var stime = Math.round(Math.random() * 2000);
	var fid = name + stime;
	console.log("ENTERING " + fid  + "<<<---"+ req); 
	setTimeout( function(){ 
		console.log(fid + " calc'ed for <"  + stime + " ms>");
		if (cb){
		    console.log(fid + " is setting a callback");
		    cb(fid, res);
		} else {
		    console.log(fid + " is NOT setting a callback");
		}
	    }, stime);
    }    
}


var pay = makeFunc("Pay");
var save = makeFunc("Save");
var email = makeFunc("Email");
var emailFail = makeFunc("Email FAIL");
var emailSuccess = makeFunc("Email SUCCESS");
var ticket = makeFunc("Ticket");

/*
save();
email();
ticket();
*/
//~~~~~~~~~~~~~~~~ pay() ~~~~~~~~~~~~~~~~~
//pay();

//~~~~~~~~~~~~~~~~ pay --> save ~~~~~~~~~~~~~~~~~
//pay(10, false, save);

//~~~~~~~~~~~~~~~~ pay --> (save || email || ticket) ~~~~~~~~~~~~~~~~~
/*
pay(15, false, 
    function(req, res){
	save(req, res);
	email(req, res);
	ticket(req, res);
    }
    );
*/


//~~~~~~~~~~~~~~~~ pay --> (save || (emailSuccess-->save) ||(emailFail-->save) || ticket) ~~~~~~~~~~~~~~~~~
pay(15, false, 
    function(req, res){
	save(req, res);
	emailSuccess(req, res, save);
	emailFail(req, res, save);
	ticket(req, res);
    }
    );
