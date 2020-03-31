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

    var options       = this.options(),
        srcFiles      = expandFiles(this.data.src),
        destDir       = path.resolve(this.data.dest),
        copyOversizedFolder = options.copyOversizedFolder || this.data.dest,
        copyOversizedPathPrefix = options.copyOversizedPathPrefix || '',
        haystack = [];

    expandFiles(options.target).forEach(function(imgPath) {
      haystack.push(path.resolve(imgPath));
    });

    var currentFileIndex = 0,
    nbDigit = srcFiles.length.toString().length
    srcFiles.forEach(function(src) {
      currentFileIndex++
      var content  = grunt.file.read(src),
          prefix = options.prefixByNumber ? "0".repeat(nbDigit - currentFileIndex.toString().length) + currentFileIndex + "_" : "",
          matches  = content.match(new RegExp(RE_CSS_URLFUNC.source, 'g')),
          outputTo = destDir+'/'+ prefix +path.basename(src),
          baseDir,
          uris;

      // Detect baseDir for using traversal image files
      baseDir = options.baseDir ? path.resolve(options.baseDir)    // specified base dir
                                : path.resolve(path.dirname(src)); // detected from src


      // List uniq image URIs
      if (matches) {
        uris = util._.uniq(matches.map(function(m) {
          return m.match(RE_CSS_URLFUNC)[1];
        }));

        // Exclude external http resource
        uris = uris.filter(function(u) {
          return !u.match('(data:|http)');
        });
      }

      // Not found image path or no file do process
      if (!matches || !uris.length) {
        grunt.file.write(outputTo, content);
        if (!options.log || options.log.skipped !== false) {
          grunt.log.subhead('SRC: file uri not found on '+src);
          grunt.log.ok('Skipped');
          grunt.log.ok('=> ' + outputTo);
        }
        return;
      }

      var headPrinted = false,
          printHead = function () {
            if (headPrinted) return;
            headPrinted = true
            grunt.log.subhead('SRC: ' + uris.length + ' file uri found on ' + src);
          }
      // Process urls
      uris.forEach(function(uri) {
        var replacement, needle, fixedUri;

        // fixed current dir when specified uri is like root
        fixedUri = (uri.indexOf('/') === 0 ? '.' + uri : uri).split('?')[0].split('#')[0];

        // Resolve image realpath
        needle = path.join(baseDir, fixedUri);


        // Assume file existing cause found from haystack
        if (haystack.indexOf(needle) !== -1) {

          // check if file exceeds the max bytes
          var fileSize = getFileSize(needle);
          if (options.maxBytes && fileSize > options.maxBytes) {
            if (options.copyOversized) {
                if (!options.log || options.log.processBinaryCopiedFiles !== false) {
                  printHead();
                  grunt.log.ok('Copied (size ' + fileSize + ' > ' + options.maxBytes + '): ' + uri + ' to ' + copyOversizedFolder);
                }
              fs.mkdirSync(copyOversizedFolder, { recursive: true });
              fs.copyFileSync(needle, path.resolve(copyOversizedFolder)+'/'+path.basename(needle))
              replacement = copyOversizedPathPrefix + path.basename(fixedUri);
            } else {
              // file is over the max size
              if (!options.log || options.log.processBinaryFileTooBig !== false) {
                printHead();
                grunt.log.ok('Skipping (size ' + fileSize + ' > ' + options.maxBytes + '): ' + uri);
              }
              return;
            }
          } else {
            // Encoding to Data uri
            replacement = datauri(needle);

            if (!options.log || options.log.processBinaryFileEncoded !== false) {
              printHead();
              grunt.log.ok('Encode: ' + needle);
            }
          }
        } else {
          if (options.fixDirLevel) {
            // Diff of directory level
            replacement = adjustDirectoryLevel(fixedUri, destDir, baseDir);

            if (!options.log || options.log.processBinaryFileAdjusted !== false) {
              printHead();
              grunt.log.ok('Adjust: ' + uri + ' -> ' + replacement);
            }
          } else {
            replacement = uri;
            if (!options.log || options.log.processBinaryFileIgnored !== false || options.exitOnError === true) {
              printHead();
              (options.exitOnError === true ? grunt.fail.warn : grunt.log.ok)('Ignore: ' + uri);
            }
          }
        }

        var escapedUri = uri.replace(/\?/g, '\\$&');
        content = content.replace(new RegExp(escapedUri, 'g'), replacement);
      });

      // Revert base to gruntjs executing current dir
      grunt.file.setBase(gruntfileDir);
      grunt.file.write(outputTo, content);
      if (headPrinted) {
        grunt.log.ok('=> ' + outputTo);
      }
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
