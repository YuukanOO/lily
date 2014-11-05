/**
 * Defines common validators methods.
 */
LilyValidators = {
  'required': function(value, opts) {  
    if(opts === false && Lily._notSet(value))
      return this.done();

    if(opts === true && Lily._notSet(value))
      return this.stop();

    return this.next();
  },
  
  'type': function(value, opts) {  
    try {
      check(value, opts);
      return this.next();
    }
    catch(e) {
      return this.stop();
    }
  },
  
  'length': function(value, opts) {
    if(_.isNumber(opts) && value.length !== opts)
      return this.stop();

    if(opts.min && value.length < opts.min)
      return this.stop();

    if(opts.max && value.length > opts.max)
      return this.stop();

    return this.next();
  },
  
  'match': function(value, opts) {
    try {
      check(opts, RegExp);
      if(!opts.test(value))
        return this.stop();
    }
    catch(e) {
      // We want to check with the property value of the object
      if(_.isString(opts) && value !== this.object[opts]) {
        return this.stop();
      }
    }
    
    return this.next();
  }
};