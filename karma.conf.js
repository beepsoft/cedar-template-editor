// Karma configuration

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'app',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      // bower
      {pattern: 'bower_components/**/*.js', included: false},

      // This line is required to load html templates using the html2js preprocessor, but it generates a 'WARNING: Tried
      // to load angular more than once.' message
      'bower_components/angular/angular.js',

      // config files
      {pattern: 'config/**/*.json', included: false},
      //{pattern: 'config/*.json', included: false},
      {pattern: 'resources/**/*.json', included: false},
      // custom libraries
      //{ pattern: 'cedar/scripts/**/*.js', included: false },
      // third party libraries
      {pattern: 'third_party_components/**/*.js', included: false},

      {pattern: 'scripts/**/*.js', included: false},
      {pattern: 'scripts/app.js', included: false},
      'scripts/keycloak/keycloak.min.js',
      'scripts/handlers/*.js',
      // RequireJS config for Karma tests
      'test-require-config.js',
      // templates
      'scripts/form/sample-directive-and-test/hello-world.directive.html',
      'scripts/form/form.directive.html'
    ],

    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // alternative: "path/to/templates/**/*.html": ["ng-html2js"]
      'scripts/**/*.html': ['ng-html2js'],
      // 'config/**/*.json': ['ng-html2js'],
      // 'config/*.json': ['ng-html2js']
      //'scripts/form/sample-directive-and-test/hello-world.directive.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      // the name of the Angular module to create
      moduleName: "my.templates"
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browserNoActivityTimeout: 100000,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode. If true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    //  Custom launcher for Travis-CI
    //  customLaunchers: {
    //   chromeTravisCI: {
    //     base: 'Chrome',
    //     flags: ['--no-sandbox']
    //   }
    // }
  });

  // Custom configuration for Travis-CI
  // if(process.env.TRAVIS) {
  //   config.browsers = ['chromeTravisCI'];
  // }
}
