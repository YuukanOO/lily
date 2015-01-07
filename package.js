Package.describe({
  name: 'yuukan:lily',
  summary: 'Tiny validation (client and server side) helper for meteor',
  version: '1.0.6',
  git: 'https://github.com/YuukanOO/lily'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('session');
  api.use('templating');
  api.addFiles('lib/middleware.js');
  api.addFiles('lib/validators.js');
  api.addFiles('lib/lily.js');
  api.addFiles('lib/templates.html');
  api.export('Lily');
  api.export('LilyValidators');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('yuukan:lily');
  api.addFiles('test/lily-tests.js');
  api.addFiles('test/validators-tests.js');
});