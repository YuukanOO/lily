Tinytest.add('core - test extend thereIs', function (test) {
  
  var obj = { _name: 'extend_test' };
  
  Lily.thereIs(obj, {
    'name': { type: String, required: true }
  });
  
  var inst = obj.fromObject({});
  test.isFalse(inst.allRight());
  
  inst = obj.fromObject({ name: 'Joe' });
  test.isTrue(inst.allRight());
  
  Lily.thereIs(obj, {
    'email': { type: String, required: true }
  });
  
  test.isFalse(inst.allRight());
  test.equal(inst.errors()[0], 'required: extend_test.email');
  
  inst = obj.fromObject({ email: 'joe@something.com' });
  test.isFalse(inst.allRight());
  
  inst = obj.fromObject({ name: 'Joe', email: 'joe@something.com' });
  test.isTrue(inst.allRight());
});