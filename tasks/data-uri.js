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

  var fs       = require('fs'),
      path     = require('path'),
      datauri  = require('datauri');

  var RE_CSS_URLFUNC = /(?:url\(["']?)(.*?)(?:["']?\))/,
      util = grunt.util,
      gruntfileDir = path.resolve('./'),
      expandFiles;

  if (grunt.file.expandFiles) {
    expandFiles = grunt.file.expandFiles;
  } else {
    expandFiles = function(files) {
      return grunt.file.expand({filter: 'isFile'}, files);
    };
  }

  grunt.registerMultiTask('dataUri', 'Convert your css file image path!!', function() {

    var options  = this.options(),
        srcFiles = expandFiles(this.data.src),
        destDir  = path.resolve(this.data.dest),
        haystack = [];

    expandFiles(options.target).forEach(function(imgPath) {
      haystack.push(path.resolve(imgPath));
    });

    srcFiles.forEach(function(src) {
      var content  = grunt.file.read(src),
          matches  = content.match(new RegExp(RE_CSS_URLFUNC.source, 'g')),
          outputTo = destDir+'/'+path.basename(src),
          baseDir,
          uris;

      // Detect baseDir for using traversal image files
      baseDir = options.baseDir ? path.resolve(options.baseDir)    // specified base dir
                                : path.resolve(path.dirname(src)); // detected from src

      // Not found image path
      if (!matches) {
        grunt.log.subhead('SRC: file uri not found on '+src);
        grunt.file.write(outputTo, content);
        grunt.log.ok('Skipped');
        grunt.log.ok('=> ' + outputTo);
        return;
      }

      // Change base to src(css, html, js) existing dir
      grunt.file.setBase(baseDir);

      // List uniq image URIs
      uris = util._.uniq(matches.map(function(m) {
        return m.match(RE_CSS_URLFUNC)[1];
      }));

      // Exclude external http resource
      uris = uris.filter(function(u) {
        return !u.match('(data:|http)');
      });

      grunt.log.subhead('SRC: '+uris.length+' file uri found on '+src);

      // Process urls
      uris.forEach(function(uri) {
        var src, replacement, needle, fixedUri;

        // fixed current dir when specified uri is like root
        fixedUri = uri.indexOf('/') === 0 ? '.' + uri : uri;

        // Resolve image realpath
        needle = path.resolve(fixedUri);

        // Assume file existing cause found from haystack
        if (haystack.indexOf(needle) !== -1) {

          // check if file exceeds the max bytes
          var fileSize = getFileSize(needle);
          if (options.maxBytes && fileSize > options.maxBytes) {
            // file is over the max size
            grunt.log.ok('Skipping (size ' + fileSize + ' > ' + options.maxBytes +'): ' + uri);
            return;
          } else {
            // Encoding to Data uri
            replacement = datauri(needle);

            grunt.log.ok('Encode: '+needle);
          }
        } else {
          if (options.fixDirLevel) {
            // Diff of directory level
            replacement = adjustDirectoryLevel(fixedUri, destDir, baseDir);
            grunt.log.ok('Adjust: '+ uri + ' -> ' + replacement);
          } else {
            replacement = uri;
            grunt.log.ok('Ignore: '+ uri);
          }
        }

        content = content.replace(new RegExp(uri, 'g'), replacement);
      });

      // Revert base to gruntjs executing current dir
      grunt.file.setBase(gruntfileDir);
      grunt.file.write(outputTo, content);
      grunt.log.ok('=> ' + outputTo);
    });
  });

  /**
   *
   * @param fullPath
   * @param options
   * @return {boolean} the file size, or undefined if not found
   */
  function getFileSize(fullPath) {

    if (!fs.existsSync(fullPath)) {
      return false;
    }

    var stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return false;
    }
    return stats.size;
  }

  /**
   * @method adjustDirectoryLevel
   * @param {String} relativePath
   * @param {String} toDir
   * @param {String} fromDir
   * @return {String} resolvedPath
   */
  function adjustDirectoryLevel(relativePath, toDir, fromDir) {
    // fix ../path/to/img.jpg to path/to/img.jpg
    var resolvedPath = relativePath.replace(/^\.\//, '');

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
      // toDir is deep than fromDir
      path.relative(fromDir, toDir).split('/').forEach(function() {
        resolvedPath = '../'+resolvedPath;
      });
    }
    return resolvedPath;
  }

};
