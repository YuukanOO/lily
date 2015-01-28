Tinytest.add('validators - required', function (test) {
  
  var model = {};
  
  Lily.thereIs(model, {
    'name': { required: true },
    'age': {},
    'gender': { required: false }
  });
  
  test.isFalse(model.allRight({}));
  test.isFalse(model.allRight({ age: 14 }));
  test.isTrue(model.allRight({ name: 'john', age: 49, gender: 'male' }));
  
});

Tinytest.add('validators - type', function (test) {
  
  var model = {};
  
  Lily.thereIs(model, {
    'name': { type: String },
    'age': { type: Number },
    'hobbies': { type: [String] }
  });
  
  test.isTrue(model.allRight({}));
  test.isFalse(model.allRight({ name: 'john', age: '49' }));
  test.isTrue(model.allRight({ name: 'john', age: 49 }));
  test.isFalse(model.allRight({ name: 5, age: '49' }));
  test.isFalse(model.allRight({ hobbies: 'music' }));
  test.isTrue(model.allRight({ hobbies: ['music', 'movies', 'sports'] }));
  
});

Tinytest.add('validators - length', function (test) {
  
  var model = {};
  
  Lily.thereIs(model, {
    'password': { length: { min: 3, max: 6 } },
    'hobbies': { length: 3 }
  });
  
  test.isFalse(model.allRight({ password: 'ko' }));
  test.isTrue(model.allRight({ password: 'pwd' }));
  test.isFalse(model.allRight({ password: 'password' }));
  test.isTrue(model.allRight({ password: 'passwo' }));
  
  test.isFalse(model.allRight({ password: 'passwo', hobbies: ['music'] }));
  test.isTrue(model.allRight({ password: 'passwo', hobbies: ['music', 'movies', 'sports'] }));
  
});

Tinytest.add('validators - match', function (test) {
  
  var model = {};
  
  Lily.thereIs(model, {
    'phone': { match: /^\d{10}$/g },
    'password': {},
    'password_confirm': { match: 'password' }
  });
  
  test.isFalse(model.allRight({ phone: 'somethingfunny' }));
  test.isFalse(model.allRight({ phone: '0455' }));
  test.isFalse(model.allRight({ phone: '04556699887' }));
  test.isTrue(model.allRight({ phone: '0455669988' }));
  
  test.isFalse(model.allRight({ password: 'foo', password_confirm: 'bar' }));
  test.isTrue(model.allRight({ password: 'foo', password_confirm: 'foo' }));
  
});