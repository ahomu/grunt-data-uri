#grunt-data-uri

This is [gruntplugin](http://gruntjs.com) task.

> Convert to data-uri from image path

##Getting Started

Install from npm.

```
% npm install grunt-data-uri
```

Add your project's `Gruntfile.js`.

```javascript
grunt.loadNpmTasks('grunt-data-uri');
```

##Example

###Config

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
        maxBytes : 2048

      }
    }
  }
}
```

For traversal image files. If `options.baseDir` is specified, use `baseDir` instead of *src css exsting dir*. That's useful when image paths in your css are absolute.

###Before `sample/css/raw/main.css`

This file is raw css.

```css
html { background-image: url('../../img/embed/will_encode.jpeg'); }
body { background-image: url('../../img/embed/not_encode.jpeg'); }
div  { background-image: url('../../img/not_encode.png'); }
```

###Execute

Execute grunt-data-uri

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

###After `sample/css/main.css`

This file is processed and output css.

```css
/* encoded to data-uri(base64) */
html { background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAAAQA...'); }
/* not encoded too large image */
body { background-image: url('../../img/embed/not_encode.jpeg'); }
/* not encoded but adjust relative path! */
div  { background-image: url('../img/not_encode.png'); }
```

##Changelog

+ 0.2.0
  + Add `maxBytes` option
  + fix `fixDirLevel` bug
+ 0.1.0
  + Add `baseDir` option
+ 0.0.2
  + Add `datauri` module
+ 0.0.1
  + first commit
