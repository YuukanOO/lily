# Lily: A tiny meteor client and server side validation helper

Lily provides a simple way to define validation model for everything you want and lets you focus on your real business.

## Overview

```javascript
// Your collection
Places = new Mongo.collection('places');

// Registering your model
Lily.thereIs(Places, {
  'name': { required: true, type: String, length: { max: 50 }, my_validator: 'lily_is_good' },
  'lat': { required: true, type: Number, default: 0 },
  'lon': { required: true, type: Number, default: 0 },
  'created_at': { type: Date, default: function() { return new Date(); } }
});

// And now, your model has some nice new functions!

// In a template event, you can use the fromTemplate function.
// It will try to find input with [name=<field>], if multiple are found, it
// assumes you wanted an Array of values
var data = Places.fromTemplate(tpl);

// In your server, you may want to remove unwanted properties before adding them
// to mongo, example:
var raw_data = { name: 'Paris', lat: 48.85, lon: 2.35, _other_value: 'unwanted' };
var data = Places.fromObject(raw_data); // { name: 'Paris', lat: 48.85, lon: 2.35 }

// In both case, you may want to check properties against the definition
var pass = data.allRight(); // true
// or
var pass = Places.allRight(data);

// If you want to retrieve errors, you can do
data.errors(); // []
// or
Lily.getErrors();

// Lily also comes with some global template helpers
// {{lilyErrors}} Contains Lily.getErrors()
// {{lilyErrorClass '<field>'}} Check wether field has errors and returns the error class defined

// And a default template called {{> lilyErrorsTemplate}} if that's your thing

// If you want to add your own validator to the validation chain, that's simple
Lily.use('my_validator', function(value, opts) {
  // value will be equals to the property value
  // and opts contains the model definition options for the current validating field
  // in our example, it contains the string 'lily_is_good'
  
  // If the validation failed, stop the chain
  if(value !== opts)
    return this.stop();
  
  // Let's call the next validator on the list (Lily._validators contains it)
  return this.next();
});

// If you want to configure Lily to suit your needs, let's say to display nice error
// messages, in your startup, you can do
Lily.configure({
  // When calling this.stop() in a validator, lily will call this function to
  // create the error message, so for our previous example
  onError: function(validator_name, validator_opts, field, model) {
    // validator_name: my_validator
    // validator_opts: 'lily_is_good'
    // field: 'name'
    // model: Places._name => 'places'
    
    return 'Oh noes, looks like the field ' + field + ' has some errors!';
  },
  
  // This is where you can adjust how you want to convert html value to property value
  // when using fromTemplate.
  // For example, the default implementation check if the definition type for the
  // current field is a boolean, if so, it looks for :checked via jquery.
  onGetTemplateValue: function($element, definition) {
    return $element.val();
  },
  
  // Use it to completely rewrite the validator order or add your own without
  // using the Lily.use thing, it's a matter of taste.
  validators: {
    'dummy': function() { this.next(); },
    'required': LilyValidators.required // btw, LilyValidators contains some default validators, just in case
  },
  
  // CSS error class used with {{lilyErrorClass '<field>'}}
  errorClass: 'my-error-css'
});

```

## TODO
- [ ] Possibility to define nested validation objects
- [ ] Readme / Guide