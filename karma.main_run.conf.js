module.exports = function(config) {
  config.set({
    frameworks: ["browserify", "jasmine"],
    files: ["src/main.js", "test/main_run_spec.js"],
    singleRun: false,
    preprocessors: {
      "test/**/*.js": ["browserify"],
      "src/**/*.js": ["browserify"]
    },
    browserify: {
      debug: true
    },
    reporters: ["progress", "html"],

    htmlReporter: {
      outputFile: "tests/units.html",

      // Optional
      pageTitle: "SanitizeJS",
      subPageTitle: "statically sanitize javascript",
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true,
      showOnlyFailed: false
    }
  });
};
