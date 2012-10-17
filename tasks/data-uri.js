/*
 * grunt-data-uri
 * http://github.com/ahomu/grunt-data-uri
 * http://aho.mu
 *
 * Copyright (c) 2012 ahomu
 * Licensed under the MIT license.
 */
module.exports = function(grunt) {

  'use strict';

  var fs      = require('fs'),
      path    = require('path'),
      datauri = require("datauri");

  var RE_CSS_URLFUNC = /(?:url\(["']?)(.*?)(?:["']?\))/,
      util = grunt.util || grunt.utils, // for 0.4.0
      baseGrunt = path.resolve('./');

  grunt.registerMultiTask('dataUri', 'Convert your css file image path!!', function() {
    // @memo this.file(0.3.x), this.files(0.4.0a) -> safe using this.data.src|dest

    var options  = this.options ? this.options() : this.data.options, // for 0.4.0
        srcFiles = grunt.file.expandFiles(this.data.src),
        destDir  = path.resolve(this.data.dest),
        haystack = grunt.file.expandFiles(options.target);

    srcFiles.forEach(function(src) {
      var content = grunt.file.read(src),
          matches = content.match(new RegExp(RE_CSS_URLFUNC.source, 'g')),
          uris = util._.uniq(matches.map(function(m) {
            return m.match(RE_CSS_URLFUNC)[1];
          })),
          baseSrc = path.resolve(path.dirname(src)),
          outputTo = destDir+'/'+path.basename(src);

      // Change base to src(css, html, js) existing dir
      grunt.file.setBase(baseSrc);

      // Not external http resource
      uris = uris.filter(function(u) {
        return !u.match('(data:|http)');
      });

      grunt.log.subhead('SRC: '+uris.length+' file uri found on '+src);

      // Process urls
      uris.forEach(function(u) {
        var src, replacement,
            needle = path.resolve(u).slice((baseGrunt+'/').length);

        // Assume file existing cause found from haystack
        if (haystack.indexOf(needle) !== -1) {
          // Encoding to Data uri
          replacement = datauri(u);

          grunt.log.ok('Encode: '+u);
        } else {
          if (options.fixDirLevel) {
            // Diff of directory level
            replacement =  adjustDirectoryLevel(u, destDir, baseSrc);
            grunt.log.ok('Adjust: '+ u + ' -> ' + replacement);
          } else {
            replacement = u;
            grunt.log.ok('Ignore: '+ u);
          }
        }

        content = content.replace(new RegExp(u, 'g'), replacement);
      });

      // Revert base to gruntjs executing current dir
      grunt.file.setBase(baseGrunt);
      grunt.file.write(outputTo, content);
      grunt.log.ok('=> ' + outputTo);
    });
  });

  /**
   * @method adjustDirectoryLevel
   * @param {String} relativePath
   * @param {String} toDir
   * @param {String} fromDir
   * @return {String} resolvedPath
   */
  function adjustDirectoryLevel(relativePath, toDir, fromDir) {
    var resolvedPath = relativePath;

    if (toDir === fromDir) {
      // both toDir and fromDir are same base.
    }
    else if (fromDir.indexOf(toDir) === 0) {
      // fromDir is shallow than toDir
      path.relative(fromDir, toDir).split('/').forEach(function() {
        resolvedPath = resolvedPath.replace(/^\.\.\//, '');
      });
    }
    else if (toDir.indexOf(fromDir) === 0 ) {
      // toDir is depp than fromDir
      path.relative(fromDir, toDir).split('/').forEach(function() {
        resolvedPath = '../'+resolvedPath;
      });
    }
    return resolvedPath;
  }

};