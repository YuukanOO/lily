Middleware = function(model, field, obj, chain) {
  
  var names = _.keys(chain);
  var value = obj[field];
  var current_index = -1;
  var pass = true;
  var context = {
    
    object: obj,
    
    next: function() {
      ++current_index;
      
      if(current_index >= names.length)
        return this.done();
      
      Lily._validators[names[current_index]].call(this, value, chain[names[current_index]]);
    },
    
    stop: function() {
      pass = false;
      Lily.addError(Lily._opts.onError(
        names[current_index], // Validator name
        chain[names[current_index]], // Validator opts
        field,
        model
        ), field);
    },
    
    done: function() {
      pass = true;
    }
  };
  
  context.next();
  
  return pass;
  
};