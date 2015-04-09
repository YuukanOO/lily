Package.describe({
  name: 'yuukan:lily',
  summary: 'Tiny validation (client and server side) helper for meteor',
  version: '1.2.1',
  git: 'https://github.com/YuukanOO/lily'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
    'underscore',
    'session',
    'templating'
  ]);

  api.addFiles([
    'lib/middleware.js',
    'lib/validators.js',
    'lib/lily.js',
    'lib/templates.html'
  ]);

  api.export([
    'Lily',
    'LilyValidators'
  ]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('yuukan:lily');
  api.addFiles([
    'test/lily-tests.js',
    'test/nested-tests.js',
    'test/validators-tests.js',
    'test/extend-tests.js'
  ]);
});