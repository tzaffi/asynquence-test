// cf. Kyle Simposon's [Async & Performance](http://www.amazon.com/You-Dont-Know-JS-Performance/dp/1491904224/ref=sr_1_1?ie=UTF8&qid=1461005366&sr=8-1&keywords=Simpson%2C+Kyle)
ASQ = require('asynquence');
//console.log("ASQ lib:\n" + ASQ);

/*************** Standard async example *****************/
ASQ(
    // step 1
    function(done){
        setTimeout( function(){
		done( "1<Hello" );
	    }, 100 );
    },
    // step 2
    function(done,greeting) {
        setTimeout( function(){
		done( greeting + " World>1" );
	    }, 100 );
    }
    )
// step 3
    .then( function(done,msg){
	    setTimeout( function(){
		    done( msg.toUpperCase() );
		}, 100 );
	} )
// step 4
    .then( function(done,msg){
	    console.log( msg );         // HELLO WORLD
	} );



/********************** handle syncrounous with val() *********************/
// step 1 (sync)
ASQ( function(done){
	done( "2<Hello" );    // manually synchronous
    } )
// step 2 (sync)
    .val( function(greeting){
	    return greeting + " World>2";
	} )
// step 3 (async)
    .then( function(done,msg){
	    setTimeout( function(){
		    done( msg.toUpperCase() );
		}, 100 );
	} )
// step 4 (sync)
    .val( function(msg){
	    console.log( msg );
	} );


/************** handling errors **************/
var sq = ASQ( function(done){
	setTimeout( function(){
		// signal an error for the sequence
		done.fail( "Oops" );
	    }, 100 );
    } )
    .then( function(done){
	    // will never get here
	} )
    .or( function(err){
	    console.log( "NOW:\n " + err );         // Oops
	} )
    .then( function(done){
	    // won't get here either
	} );

// later

sq.or( function(err){
	console.log( "LATER:\n" + err );         // Oops
    } );


/**************** reporting errors ********************/
/*
try{
    var sq1 = ASQ( function(done){
	    doesnt.Exist();         // will throw exception to console
	} );
}catch( err ){
    console.log("had to catch so as not to blow up:\n" + err);
}
*/
var sq2 = ASQ( function(done){
	doesnt.Exist();         // will throw only a sequence error
    } )
    // opt-out of error reporting
    .defer();


setTimeout( function(){
	//		sq1.or( function(err){
	//		console.log( err ); // ReferenceError
	//	    } );
	
	sq2.or( function(err){
		console.log( err ); // ReferenceError
	    } );
    }, 100 );


/********************* gate() AKA all()   ********************/
ASQ( function(done){
	setTimeout( done, 100 );
    } )
    .gate(
	  function(done){
	      setTimeout( function(){
		      done( "GATE: Hello" );
		  }, 100 );
	  },
	  function(done){
	      setTimeout( function(){
		      done( "World", "!" );
		  }, 100 );
	  }
	  )
    .val( function(msg1,msg2){
	    console.log( msg1 );    // Hello
	    console.log( msg2 );    // [ "World", "!" ]
	} );


ASQ( function(done){
	setTimeout( done, 100 );
    } )
    .all(
	  function(done){
	      setTimeout( function(){
		      done( "ALL: Hello" );
		  }, 100 );
	  },
	  function(done){
	      setTimeout( function(){
		      done( "World", "!" );
		  }, 100 );
	  }
	  )
    .val( function(msg1,msg2){
	    console.log( msg1 );    // Hello
	    console.log( msg2 );    // [ "World", "!" ]
	} );



/************ asynquence-contrib  ********************/

ASQ = require('asynquence-contrib');
function success1(done) {
    setTimeout( function(){
	    done( 1 );
	}, 100 );
}

function success2(done) {
    setTimeout( function(){
	    done( 2 );
	}, 100 );
}

function failure3(done) {
    setTimeout( function(){
	    done.fail( 3 );
	}, 100 );
}

function output(msg) {
    console.log( msg );
}


//RACE:
ASQ().race(
	   failure3,
	   success1
	   )
    .or( output );      // 3

//ANY:
ASQ().any(
	  success1,
	  failure3,
	  success2
	  )
    .val( function(){
	    var args = [].slice.call( arguments );
	    console.log(
			args        // [ 1, undefined, 2 ]
			);
	} );


//first:
ASQ().first(
	    failure3,
	    success1,
    success2
	    )
    .val( output );     // 1


//last:
ASQ().last(
	   failure3,
	   success1,
    success2
	   )
    .val( output );     // 2

//none:
    ASQ().none(
    failure3
	       )
    .val( output )      // 3
    .none(
	  failure3,
	  success1
	  )
    .or( output );      // 1


//map:
function double(x,done) {
    setTimeout( function(){
	    done( x * 2 );
	}, 100 );
}

ASQ().map( [1,2,3], double )
    .val( output );                 // [2,4,6]


function plusOne(x,done) {
    setTimeout( function(){
	    done( x + 1 );
	}, 100 );
}

ASQ( [1,2,3] )
    .map( double )          // message `[1,2,3]` comes in
    .map( plusOne )         // message `[2,4,6]` comes in
    .val( output );         // [3,5,7]


//waterfall
function double2(done) {
    var args = [].slice.call( arguments, 1 );
    console.log( args );

    setTimeout( function(){
	    done( args[args.length - 1] * 2 );
	}, 100 );
}

ASQ( -3 )
    .waterfall(
	       double2,                 // [ -3 ]
	       double2,                 // [ -6 ]
	       double2,                 // [ -6, -12 ]
	       double2                  // [ -6, -12, -24 ]
	       )
    .val( function(){
	    var args = [].slice.call( arguments );
	    console.log( "val() says: "+ args );    // [ -6, -12, -24, -48 ]
	} );


//Skipping "Error Tolerance"

//until:
var count = 0;

ASQ( 17 )
    .until( double2 )
    .val( output )                  // 34
    .until( function(done){
	    count++;

	    setTimeout( function(){
		    if (count < 5) {
			done.fail();
		    }
		    else {
			// break out of the `until(..)` retry loop
			done.break( "Gosh darnit" );
		    }
		}, 100 );
	} )
    .or( output );                  // Oops

//skipping Promise-Style steps

//skipping forking

//subsume
var sq5 = ASQ( function(done){
	setTimeout( function(){
		done( "Hello World from sq5" );
	    }, 200 );
    } );

ASQ( function(done){
	setTimeout( done, 100 );
    } )
// subsume `sq` sequence into this sequence
    .seq( sq5 )
    .val( function(msg){
	    console.log( msg );     // Hello World for sq5
	} )


// Value and Error Sequences

var sq5 = ASQ( 42 );
sq5.val( function(msg){
	console.log( msg );     // 42
    } );

// automqically errored:

var sq6 = ASQ.failed( "Oops" );

ASQ()
    .seq( sq6 )
    .val( function(msg){
	    // won't get here
	} )
    .or( function(err){
	    console.log( err );     // Oops
	} );

// delay/timeOut

var sq7 = ASQ.after( 1100, "7<Hello", "World>7" );
var sq8 = ASQ.failAfter( 1200, "8<Oops>8" );

sq7.val( function(msg1,msg2){
	console.log( msg1, msg2 );      // Hello World
    } );

sq8.or( function(err){
	console.log( err );             // Oops
    } );

//You can also insert a delay in the middle of a sequence using after(..):

ASQ( 43 )
// insert a delay into the sequence
    .after( 1400 )
    .val( function(msg){
	    console.log( msg );     // 42
	} );

// skipping Promises and Callbacks - but this MAY be important

// skipping iterable sequences

// mixing generatros and promises and running them
function doublePr(x) {
    return new Promise( function(resolve,reject){
	    setTimeout( function(){
		    resolve( x * 2 );
		}, 2200 );
    } );
}

function doubleSeq(x) {
    return ASQ( function(done){
	    setTimeout( function(){
		    done( x * 2)
			}, 2100 );
	} );
}
//Now we can use runner(..) as a step in the middle of a sequence:
ASQ( 10, 11 )
    .runner( function*(token){
	    var x = token.messages[0] + token.messages[1];

	    // yield a real promise
	    x = yield doublePr( x );

	    // yield a sequence
	    x = yield doubleSeq( x );

	    return x;
	} )
    .val( function(msg){
	    console.log( msg );         // 84
	} );

//Skipping wrapped generators