Tinytest.add('utils - test getDefault', function (test) {
  
  var obj = {
    default_static: 5,
    default_dynamic : function() { return 6 * 2; }
  };
  
  test.equal(5, Lily._getDefault(obj.default_static));
  test.equal(12, Lily._getDefault(obj.default_dynamic));
  
  test.isTrue(Lily._notSet(''));
  test.isTrue(Lily._notSet(null));
  test.isTrue(Lily._notSet([]));
  test.isTrue(Lily._notSet(undefined));
  test.isFalse(Lily._notSet('toto'));
  test.isFalse(Lily._notSet(false));
  test.isFalse(Lily._notSet(0));
  
});

Tinytest.add('core - Default stack check', function(test) {
  
  var model = { _name: 'user_registration' };
  
  Lily.thereIs(model, {
    'first_name': { type: String, required: true },
    'last_name': { required: true, type: String },
    'age': { type: Number },
    'password': { required: true, length: { min: 2, max: 4 } },
    'password_confirm': { required: true, match: 'password' }
  });
  
  test.isFalse(model.allRight({}));
  test.isFalse(model.allRight({ first_name: 'john', last_name: 'doe' }));
  test.isFalse(model.allRight({ first_name: 'john', last_name: 'doe', age: '49' }));
  test.equal(3, Lily.getErrors().length);
  test.equal('type: user_registration.age', Lily.getErrors()[0]);
  
  test.isFalse(model.allRight({ first_name: 'john', last_name: 'doe', password: 'joe' }));
  test.equal(1, Lily.getErrors().length);
  test.equal('required: user_registration.password_confirm', Lily.getErrors()[0]);
  
  test.isFalse(model.allRight({ first_name: 'john', last_name: 'doe', password: 'joe', password_confirm: 'jeo' }));
  test.equal(1, Lily.getErrors().length);
  test.equal('match: user_registration.password_confirm', Lily.getErrors()[0]);
  test.isTrue(model.allRight({ first_name: 'john', last_name: 'doe', age: 49, password: 'joe', password_confirm: 'joe' }));
  
});

Tinytest.add('utils - Errors addition/removal', function(test) {
  Lily.addError('some-error', 'username');
  
  var errors = Lily.getErrors();
  test.equal(1, errors.length);
  test.isTrue(Lily.hasErrors('username'));
  test.isFalse(Lily.hasErrors('password'));
  
  Lily.clearErrors();
  Lily.addError('some-error', ['username', 'password']);
  test.isTrue(Lily.hasErrors('username'));
  test.isTrue(Lily.hasErrors('password'));
});

Tinytest.add('core - fromObject', function(test) {
    
  var model = { _name: 'place' };
  
  Lily.thereIs(model, {
    'address': { type: String, required: true, default: 'somewhere' },
    'lat': { required: false, type: Number },
    'lon': { type: Number },
    'is_set': { type: Boolean, required: true, default: false }
  });
  
  var foo = { varB: 67, lat: 0, lon: -1 };
  var res = model.fromObject(foo);
  
  test.isTrue(res.allRight());
  test.equal(0, res.errors().length);
  test.isTrue(_.isUndefined(res.varB));
  test.equal(0, res.lat);
  test.equal(-1, res.lon);
  test.equal('somewhere', res.address);
  test.equal(false, res.is_set);
  
});