module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // sample configuration
    dataUri: {
      dist: {
        src: ['test/fixtures/*.css'],
        dest: 'test',
        options: {
          target: ['test/img/embed/*.*'],
          fixDirLevel: true,
          maxBytes: 10240
        }
      }
    },
    contributors: {
      dist: {
        path: 'AUTHORS',
        branch: 'development',
        chronologically: false
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Load npm tasks.
  grunt.loadNpmTasks('grunt-git-contributors');

  // Default task.
  grunt.registerTask('default', 'dataUri');

};
