'use strict';

require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'handlebars'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    // show elapsed time at the end
    require('time-grunt')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: '.',
        dist: 'build'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,

        // watch list
        watch: {
            
            livereload: {
                files: [
                    
                    'scripts/{,**/}*.js',
                    'templates/{,**/}*.hbs',
                    'test/spec/{,**/}*.js'
                ],
                tasks: ['exec'],
                options: {
                    livereload: true
                }
            }
        },

        // testing server
        connect: {
            testserver: {
                options: {
                    port: 1234,
                    base: '.'
                }
            }
        },

        // mocha command
        exec: {
            mocha: {
                command: 'mocha-phantomjs http://localhost:<%= connect.testserver.options.port %>/test',
                stdout: true
            }
        },

        

        // open app and test page
        open: {
            server: {
                path: 'http://localhost:<%= connect.testserver.options.port %>'
            }
        },

        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },

        // linting
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                '!Gruntfile.js',
                'scripts/*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // require
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    name:"main",
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: 'scripts',
                    optimize: 'uglify',
                    paths: {
                        'templates': '../../.tmp/scripts/templates'
                    },
                    mainConfigFile: 'scripts/init.js',
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                    pragmasOnSave: {
                        //removes Handlebars.Parser code (used to compile template strings) set
                        //it to `false` if you need to parse template strings even after build
                        excludeHbsParser : true,
                        // kills the entire plugin set once it's built.
                        excludeHbs: true,
                        // removes i18n precompiler, handlebars and json2
                        excludeAfterBuild: true
                    },
                    wrapShim: false,
                    out:'build/scripts/kuittipankki.js'
                }
            }
        },

        useminPrepare: {
            html: '<%= yeoman.app %>/prod/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },

        usemin: {
            html: ['<%= yeoman.dist %/prod/*.html'],
            css: ['<%= yeoman.dist %>/css/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        cssmin: {
            target: {
                files: {
                    '<%= yeoman.dist %>/css/style.css': [
                        'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
                        'bower_components/dropzone/dist/dropzone.css',
                        'bower_components/jquery-ui/themes/base/jquery-ui.css',
                        'bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.css',
                        'css/bootstrap-sandstone.css',
                        'css/style.css'
                    ]
                }
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: false,
                    removeEmptyAttributes: true,
                    removeOptionalTags: false,
                    preserveLineBreaks: true
                },
                files: [{
                    'build/index.html':'prod/index.html'
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'scripts/vendor/require.min.js'
                    ]
                }, {
                    dot: true,
                    expand:true, 
                    flatten:true,
                    cwd: '<%= yeoman.app %>',
                    src:'bower_components/bootstrap/fonts/*.*', 
                    dest: '<%= yeoman.dist %>/fonts/',
                }]
            }
        },

        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },

        // handlebars
        handlebars: {
            compile: {
                options: {
                    namespace: 'JST',
                    amd: true
                },
                files: {
                    '.tmp/scripts/templates.js': ['templates/**/*.hbs']
                }
            }
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
    });

    // starts express server with live testing via testserver
    grunt.registerTask('default', function (target) {

        // what is this??
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.option('force', true);

        grunt.task.run([
            'clean:server',
            'connect:testserver',
            'exec',
            'open',
            'watch'
        ]);
    });

    // todo fix these
    grunt.registerTask('test', [
        'clean:server',
        'createDefaultTemplate',
        'handlebars',
        'compass',
        'connect:testserver',
        'exec:mocha'
    ]);

    grunt.registerTask('build', [
        'createDefaultTemplate',
        'handlebars',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'cssmin',
        'copy',
        'usemin'
    ]);

};
