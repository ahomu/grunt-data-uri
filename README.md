# grunt-data-uri-advanced

[![npm version][npm-image]][npm-url] [![build status][circle-image]][circle-url]

This is [gruntplugin](http://gruntjs.com) task.

> Convert to data-uri from image path

## Getting Started

Install from npm.

```
% npm i -D grunt-data-uri-advanced
```

Add your project's `Gruntfile.js`.

```javascript
grunt.loadNpmTasks('grunt-data-uri-advanced');
```

## Example

### Config

```javascript
grunt.initConfig({
  // sample configuration
  dataUri: {
    dist: {
      // src file
      src: ['sample/css/raw/*.css'],
      // output dir
      dest: 'sample/css',
      options: {
        // specified files are only encoding
        target: ['sample/img/embed/*.*'],
        // adjust relative path?
        fixDirLevel: true,
        // img detecting base dir
        // baseDir: './'

        // Do not inline any images larger
        // than this size. 2048 is a size
        // recommended by Google's mod_pagespeed.
        maxBytes : 2048,

        // Control the output of the script
        log: {
            skipped: true,
            processBinaryFileTooBig: true,
            processBinaryFileEncoded: true,
            processBinaryFileAdjusted: true,
            processBinaryFileIgnored: true
        },

        // Generates an error when a file is ignored
        exitOnError: false,

        prefixByNumber: false, // prefix the name of all file names processed by an incremental number

        copyOversized: true, // copy file in specified folder when its size exceeds maxBytes
        copyOversizedFolder: 'sample/css', // specified folder, default value is same of 'dest'
        copyOversizedPathPrefix: '', // prefix for css files ex: url('copyOversizedPathPrefix/filename.ext')

      }
    }
  }
}
```

For traversal image files. If `options.baseDir` is specified, use `baseDir` instead of *src css exsting dir*. That's useful when image paths in your css are absolute.

### Before `sample/css/raw/main.css`

This file is raw css.

```css
html { background-image: url('../../img/embed/will_encode.jpeg'); }
body { background-image: url('../../img/embed/not_encode.jpeg'); }
div  { background-image: url('../../img/not_encode.png'); }
```

### Execute

Execute grunt-data-uri-advanced

```
% grunt dataUri
Running "dataUri:dist" (dataUri) task

SRC: 3 file uri found on sample/css/raw/main.css
>> Encode: ../../img/embed/will_encode.jpeg
>> Skipping (size 24875 > 10240): ../../img/embed/not_encode.jpeg
>> Adjust: ../../img/not_encode.png -> ../img/not_encode.png
>> => path/to/project/sample/css/main.css

Done, without errors.
```

### After `sample/css/main.css`

This file is processed and output css.

```css
/* encoded to data-uri(base64) */
html { background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAAAQA...'); }
/* not encoded too large image */
body { background-image: url('../../img/embed/not_encode.jpeg'); }
/* not encoded but adjust relative path! */
div  { background-image: url('../img/not_encode.png'); }
```

## Tests

```
npm install
npm test
```

## Changelog

+ 0.3.0
  + Update `data-uri` module
  + Remove query and hash fragment from url
+ 0.2.0
  + Add `maxBytes` option
  + fix `fixDirLevel` bug
+ 0.1.0
  + Add `baseDir` option
+ 0.0.2
  + Add `datauri` module
+ 0.0.1
  + first commit

## License

MIT

[npm-image]: https://img.shields.io/npm/v/grunt-data-uri.svg
[npm-url]: https://npmjs.org/package/grunt-data-uri
[circle-image]: https://circleci.com/gh/ahomu/grunt-data-uri.svg?style=shield&circle-token=70d7bb05af15f1464e583704a4ee117664b49dc8
[circle-url]: https://circleci.com/gh/ahomu/grunt-data-uri
[deps-image]: https://david-dm.org/ahomu/grunt-data-uri.svg
[deps-url]: https://david-dm.org/ahomu/grunt-data-uri
