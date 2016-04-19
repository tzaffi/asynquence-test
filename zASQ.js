ASQ = require('asynquence-contrib');

ASQ(
    function(done){
	done( "first out", "second out");
    },
    function(done, first, second, third){
	console.log("first: "+first+"\nsecond: "+second);
	console.log("third: "+third);
    }
    );

ASQ(
    function(done){
	done.fail( "4) ERROR", "5) ERROR");
    },
    function(done, first, second, third){
	console.log("first: "+first+"\nsecond: "+second);
	console.log("third: "+third);
    }
    ).or( function(e1, e2){
	    console.log(e1 + "--:--" + e2);
	});;

//args: gate0,gate1,gate2,gate0,gate3,gate4,gate5
ASQ( "gate0" 
     )
    .gate(
	  function(done, m1){
	      done(m1, "gate1", "gate2");
	  },
	  function(done, m1){
	      done(m1, "gate3", "gate4", "gate5");
	  }
	  )
    .val( function() {
	    console.log("args: " + [].slice.call( arguments ));
	}
	);
     
