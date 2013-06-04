module.exports = function(grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),

        meta : {
            banner : "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\" : \"\" %>" +
                "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" +
                " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
        },

        test : {
            files : ["test/**/*.js"]
        },

        uglify : {
            dist : {
                src : "lib/bilbo.js",
                dest : "dist/bilbo.js"
            }
        },

        jshint : {
            options : {
                /* enforcing */
                strict : true,
                bitwise : false,
                curly : true,
                eqeqeq : true,
                immed : true,
                latedef : true,
                newcap : true,
                noarg : true,
                noempty : true,
                plusplus : true,
                quotmark : "double",

                undef : true,

                /* relaxing */
                eqnull : true,
                sub : true,

                /* environment */
                browser : true,
                node : true
            },
            globals : {},

            files : ["Gruntfile.js", "lib/**/*.js", "test/**/*.js"]
        },

        yuidoc : {
            compile: {
                name: "<%= pkg.name %>",
                description: "<%= pkg.description %>",
                version: "<%= pkg.version %>",
                url: "<%= pkg.homepage %>",
                options: {
                    paths: "lib/",
                    outdir: "docs/"
                }
            }
          }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");

    // Local tasks
    grunt.loadTasks("tasks");

    // Defaults
    grunt.registerTask("default", ["jshint", "test", "uglify", "yuidoc"]);

};