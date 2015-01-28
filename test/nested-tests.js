Tinytest.add('core - nested allRight', function (test) {
  
  var model_obj = { _name: "nested_tests" };
  var model_def = Lily.thereIs(model_obj, {
    'username': { type: String, required: true },
    'settings': Lily.Object({
      'per_page': { type: Number, required: true }
    })
  });
  
  test.isFalse(model_obj.allRight());
  
  var err = Lily.getErrors();
  
  test.equal(2, err.length);
  test.equal('required: nested_tests.username', err[0]);
  test.equal('required: nested_tests.settings.per_page', err[1]);
  
  test.isFalse(model_obj.allRight({ settings: { per_page: 5 }}));
  
  err = Lily.getErrors();
  
  test.equal(1, err.length);
  test.equal('required: nested_tests.username', err[0]);
  
  test.isFalse(model_obj.allRight({ username: 'lily', settings: 5 }));
  
  test.isTrue(model_obj.allRight({
    username: 'john',
    settings: {
      per_page: 7
    }
  }));
  
});

Tinytest.add('core - nested fromObject', function(test) {
  
  var model_obj = { _name: "nested_tests" };
  var def = {
    'username': { type: String, required: true },
    'settings': Lily.Object({
      'per_page': { type: Number, required: true },
      'paginate': { type: Boolean, required: true, default: false },
      'something': { required: true, default: function() { return 'else';  } }
    })
  };
  var model_def = Lily.thereIs(model_obj, def);
  
  var foo = { varB: 67, username: 'john' };
  var res = model_obj.fromObject(foo);
  
  test.isFalse(_.isUndefined(res.settings));
  test.isFalse(res.allRight());
  test.equal(false, res.settings.paginate);
  test.equal('else', res.settings.something);
  
  foo = { varB: 67, username: 'john', settings: { varC: 5, per_page: 10, paginate: true } };
  res = model_obj.fromObject(foo);
  
  test.isTrue(res.allRight());
  test.isTrue(_.isUndefined(res.varB));
  test.isTrue(_.isUndefined(res.settings.varC));
  test.equal('john', res.username);
  test.equal('else', res.settings.something);
  test.equal(true, res.settings.paginate);
  test.equal(10, res.settings.per_page);
  
});