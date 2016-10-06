/******************* CONVENTIONS
 *
 * To make it a little easier to program and plug and play, 
 * we specify some conventions for how Asynquence-compatible
 * functions should be declared and writted:
 *
 * Parameters - There should be exactly 2:
 *    o- done - the ASQ callback object
 *    o- params - an object that aggregates both the input and result
 *
 * If done DNE, the function should simply return the params object
 * If params DNE, the function should create it as an object
 *
 * Output - as above there are two possibilities
 *    o- done DNE - in which case we call `return params`
 *    o- done exists - in which case we call `done(params)`
 *
 * Expected values - each function should specify it its comments which
 *   values are required to be available inside of the params object.
 *   If the expected values are not found, then an exception should be generated
 *   that comports with whether or not done is available:
 *     o- done DNE - throw an exception
 *     o- done exists - call done.fail()
 *
 * Return values - each function should specify in its comments which
 *   values will be returned inside of the params object. 
 *    o- no value out will return in no additional value being added to params
 *    o- by convention, the key given to params will be the same as the variable name
 * 
 * EXAMPLE:
// Expected params: val
// Output params: valx2, valx3
var doublerAndTriplerr = function(done, params){
  // TOP BOILER-PLATE:
  if(!params) params = {};
  if(!params.val){
    if(done){
      done.fail('val is missing from params');
    } else {
      throw 'val is missing from params';
    }
  } 
 
  // THE CUSTOM CODE:
  params.valx2 = 2*params.val;
  params.valx3 = 3*params.val;

  // BOTTOM BOILER-PLATE:
  if(done){
    done(params);
  } else {
    return params;
  }
}
 *********************/

var ASQ = require('asynquence-contrib');

var topFailureBoilerplate = function(done, params, expectedVals){
  expectedVals.forEach(val => {
    if(!params.val){
      var msg = `${val} is missing from params`;
      if(done){
        done.fail(msg);
      } else {
        throw msg;
      }
    } 
  });
}

// call with `return bottomBoilerplate(done, params);`
var bottomBoilerplate = function(done, params){
  if(done){
    done(params);
  } else {
    return params;
  }
}


// Expected params: val
// Output params: valx2, valx3
var doublerAndTripler = function(done, params){
  // TOP BOILER-PLATE:
  if(!params) params = {};
  if(!params.val){
    if(done){
      done.fail('val is missing from params');
    } else {
      throw 'val is missing from params';
    }
  } 
 
  // THE CUSTOM CODE:
  params.valx2 = 2*params.val;
  params.valx3 = 3*params.val;

  // BOTTOM BOILER-PLATE:
  if(done){
    done(params);
  } else {
    return params;
  }
}

// Expected params: val, valx2, valx3
// Output params: valP13, valx2P13, valx3P13
var thirteenAdder = function(done, params){
  var expectedVals = [ "val", "valx2", "valx3" ];

  if(!params) params = {}; // this one is unavoidable without some crazy JS hoops
  topFailureBoilerplate(done, params, expectedVals);

  params.valP13 = params.val + 13;
  params.valx2P13 = params.valx2 + 13;
  params.valx3P13 = params.valx3 + 13;
  
  return bottomBoilerplate(done, params);
}

ASQ(
  { val: 7 },
  doublerAndTripler,
  thirteenAdder,
  (done, params) => console.log(params)
);
