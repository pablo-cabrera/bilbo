module.exports = function(grunt) {

    var path = require("path"),
        http = require("http"),
        ytestrunner = require("ytestrunner"),
        YUITest = require("yuitest"),

        coverage = process.env.COVERAGE,
        cwd = process.cwd();

    grunt.registerMultiTask("test", "YUI Test Runner", function() {
        var done = this.async(),
            includes = this.filesSrc,

            run = function() {
                console.log("[TEST] Test files: " + includes);

                ytestrunner.cli.runConfig({
                    verbose: false,
                    coverage: coverage ? coverage === "true" : true,
                    saveResults: true,
                    resultsFile: path.resolve(cwd, 'test-result/results'),
                    fastCover: false,
                    saveCoverage: true,
                    coverageFile: path.resolve(cwd, 'test-result/coverage'),
                    colors: true,
                    root: cwd,
                    tmp: '/tmp',
                    include: includes,
                    exclude: [],
                    covInclude: [ 'lib/**/*.js' ],
                    covExclude: [ '**/.*', '**/node_modules/**' ],
                    resultsFormat: 'junitxml',
                    coverageReportFormat: 'lcov'
                }, function(err, testData) {
                    //Async fail if any test fails
                    done(testData.failed === 0);
                });
            };

        YUITest.TestRunner.subscribe(YUITest.TestRunner.TEST_PASS_EVENT, function(event) {
            var msg = "[" + "PASS".green + "] " + event.testCase.name + "::" + event.testName;
            console.log(msg.bold);
        });

        YUITest.TestRunner.subscribe(YUITest.TestRunner.TEST_FAIL_EVENT, function(event) {
            var msg = "[" + "FAIL".red + "] " + event.testCase.name + "::" + event.testName;
            console.log(msg.bold);

            console.log(event.error.toString().red.bold);
            var stack = event.error.stack;
            if (stack) {
                console.log(stack.red.bold);
            }
        });

        run();
    });

};
