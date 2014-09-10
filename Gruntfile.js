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
          fixDirLevel: true,
          maxBytes: 10240
        }
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'dataUri');

};
