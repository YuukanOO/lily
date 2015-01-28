Lily = (function() {
  
  /**
   * Defaults values for the lily configuration.
   */
  var defaults = {
    /**
     * Called when a validation error occured to returns a friendly message.
     */
    onError: function(validator_name, validator_opts, field, model) {
      return (validator_name + ': ' + model + '.' + field);
    },
    
    /**
     * Called when getting the value of an element from the template.
     */
    onGetTemplateValue: function($element, definition) {

      var t = definition.type;

      if(t) {
        switch(t) {
          case Boolean:
            return $element.is(':checked');
          case Number:
            var val = $element.val().trim();
            if(val === '')
              return null;
            var number_value = Number(val);
            return isNaN(number_value) ? 'NaN' : number_value;
        }
      }

      return $element.val();
    },
    
    /**
     * Defines the basic chain of validators, you can override it or call
     * Lily.use for each of the ones you want.
     */
    validators: {
      'required': LilyValidators.required,
      'type': LilyValidators.type,
      'length': LilyValidators.length,
      'match': LilyValidators.match
    },
    
    /**
     * CSS Error class when using the helper lilyErrorClass '<field_name>'.
     */
    errorClass: 'error'
  };
  
  /**
   * Lily constructor.
   */
  function Lily() {
    this._validators = {};
    this._opts = defaults;
    this.SESS_ERRORS_KEY = "SESS_ERRORS_KEY";
    this.SESS_ERRORS_MSG = "SESS_ERRORS_MSG";
    this.init();
  }
  
  /**
   * Declare a nested object in a lily definition.
   */
  Lily.prototype.Object = function(nested_def) {
    var nested_obj = { 
      __is_lily_nested: true,
      _name: null, // Will be set by thereIs and equal to fullname
      __template_prefix: null // Will be set by thereIs and equal to field name _ nested field
    };
    
    return this._defineObject(nested_obj, nested_def);
  };
    
  /**
   * Add an error message for the optionnal given field.
   */
  Lily.prototype.addError = function(msg, fields) {
    var self = this;
    
    if(!_.isArray(fields))
          fields = [fields];
    
    if(Meteor.isClient) {
      var errors = Session.get(this.SESS_ERRORS_MSG);
      errors.push(msg);
      Session.set(this.SESS_ERRORS_MSG, errors);
      
      if(fields) {
        var fields_in_error = Session.get(this.SESS_ERRORS_KEY);
        
        _.each(fields, function(field) {
          fields_in_error[field] = true;
        });
        
        Session.set(this.SESS_ERRORS_KEY, fields_in_error);
      }
    }
    else {
      this._errors.push(msg);
      
      if(fields) {
        _.each(fields, function(field) {
          self._errors_key[field] = true;
        });
      }
    }
  };
  
  /**
   * Check wether or not a field has errors.
   */
  Lily.prototype.hasErrors = function(field) {
    if(Meteor.isClient)
       return _.has(Session.get(this.SESS_ERRORS_KEY), field);
    else
      return _.has(this._errors_key, field);
  };
  
  /**
   * Clear all errors from the session.
   */
  Lily.prototype.clearErrors = function() {
    if(Meteor.isClient) {
      Session.set(this.SESS_ERRORS_MSG, []);
      Session.set(this.SESS_ERRORS_KEY, {});
    }
    else {
      this._errors = [];
      this._errors_key = {};
    }
  };
  
  /**
   * Retrieve current validation errors.
   */
  Lily.prototype.getErrors = function() {
    if(Meteor.isClient) {
      return Session.get(this.SESS_ERRORS_MSG);
    }
    else {
      return this._errors;
    }
  };
  
  /**
   * Init lily, register global template helpers such as:
   */
  Lily.prototype.init = function() {
    var self = this;
    
    this.clearErrors();
    
    // Register each validator
    this._validators = {};
    
    _.each(this._opts.validators, function(val, key) {
      self.use(key, val);
    });
    
    // Register global helpers for client templates
    if(Meteor.isClient) {
      Template.registerHelper('lilyErrors', function() {
        return self.getErrors();
      });
      
      Template.registerHelper('lilyErrorClass', function(field) {
        return (self.hasErrors(field) && self._opts.errorClass);
      });
    }
  };
  
  /**
   * Configure Lily with the given options.
   */
  Lily.prototype.configure = function(opts) {
    this._opts = _.extend(defaults, opts);
    this.init();
  };
  
  /**
   * Register a validator with the given name and function.
   * The registered function should call at least one of next or stop.
   */
  Lily.prototype.use = function(validator_name, validator_func) {
    this._validators[validator_name] = validator_func;
  };
  
  /**
   * Register a model object to Lily and add methods to this object.
   * The model_definition define properties of validation.
   */
  Lily.prototype.thereIs = function(model_obj, model_definition) {
    return this._defineObject(model_obj, model_definition);
  };
  
  /**
   * Inner method to define an object with associated validation
   * definition.
   */
  Lily.prototype._defineObject = function(obj, definition) {
    var self = this;
    var fields = _.keys(definition);
    
    // Add the required: false validator to field without required value
    // and set nested object name
    _.each(fields, function(field) {
      if(_.isUndefined(definition[field].required))
        definition[field].required = false;
      if(definition[field].__is_lily_nested) {
        definition[field]._name = obj._name + '.' + field;
        definition[field].__template_prefix = field + '_';
      }
    });
    
    /**
     * Try to validate obj with the rules of this model.
     */
    obj.allRight = function(o) {
      
      o = o || {};
      
      if(!obj.__is_lily_nested)
        self.clearErrors();
      
      var pass = true;
      
      // Loop through each field of the model definition
      _.each(fields, function(field) {
        
        if(definition[field].__is_lily_nested) {
          pass &= definition[field].allRight(o[field]);
        }
        else {
          // Use a middleware to check validation status
          pass &= Middleware(
                      obj._name,
                      field,
                      o, 
                      _.pick(definition[field], _.keys(self._validators)));
        }
        
      });
      
      return pass;
      
    };
    
    /**
     * Helper to create a model object from the given template
     * based on input name attribute.
     */
    obj.fromTemplate = function(tpl) {
      var created_object = {};
      
      _.each(fields, function(field_name) {
        var $ele = tpl.$('[name=' + (obj.__template_prefix || '') + field_name + ']');
        
        if(definition[field_name].__is_lily_nested)
          created_object[field_name] = definition[field_name].fromTemplate(tpl);
        else {
          if($ele.length === 1) {
            created_object[field_name] = self._opts.onGetTemplateValue(
              $ele, definition[field_name]);
          }
          else if($ele.length > 1) {
            // If multiple name was found, assumes we want an array of values
            created_object[field_name] = _.map($ele, function(ele) 
              { 
                return self._opts.onGetTemplateValue($(ele), definition[field_name]); 
              });
          }
          else if(!_.isUndefined(definition[field_name].default)) {
            // Element not found but the model has a default property
            created_object[field_name] = self._getDefault(
              definition[field_name].default);
          }
        }
      });
      
      created_object.allRight = function() {
        return obj.allRight(this);
      };
      
      created_object.errors = function() {
        return self.getErrors();
      };
      
      return created_object;
    };
    
    /**
     * Remove unwanted keys and attach helpers function to the returned object.
     */
    obj.fromObject = function(o) {
      o = o || {};
      
      var new_obj = _.pick(o, fields);
      
      // Add default values
      _.each(fields, function(name) {
        if(!_.isUndefined(definition[name].default) && _.isUndefined(new_obj[name]))
          new_obj[name] = self._getDefault(definition[name].default);
        if(definition[name].__is_lily_nested)
          new_obj[name] = definition[name].fromObject(o[name]);
      });
      
      new_obj.allRight = function() {
        return obj.allRight(this);
      };
      
      new_obj.errors = function() {
        return self.getErrors();
      };
      
      return new_obj;
    };
    
    return obj;
  };
  
  /**
   * Retrieve the default of a given property (static or function).
   */
  Lily.prototype._getDefault = function(prop) {
    return (_.isFunction(prop) ? prop() : prop);
  };
  
  /**
   * Check wether a property is set or no.
   */
  Lily.prototype._notSet = function(prop) {
    if(_.isUndefined(prop) || prop === null)
      return true;
    
    if((_.isString(prop) || _.isArray(prop)) && _.isEmpty(prop))
      return true;
    
    return false;
  };
  
  // And finally, returns the lily object
  return new Lily();
  
})();