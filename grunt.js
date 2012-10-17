module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // sample configuration
    dataUri: {
      dist: {
        src: ['sample/css/raw/*.css'],
        dest: 'sample/css',
        options: {
          target: ['sample/img/embed/*.*'],
          fixDirLevel: true
        }
      }
    },
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'lint dataUri');

};
