#grunt-data-uri

This is [gruntplugin](http://gruntjs.com) task. Support gruntjs version are 0.3.x and 0.4.0a(devel).

> Convert to data-uri from image path

##Getting Started

Install from npm.

```
% npm install grunt-data-uri
```

Add your project's `grunt.js` (`Gruntfile.js` when ~0.4.0a).

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
        fixDirLevel: true
      }
    }
  }
}
```

###Before `sample/css/raw/main.css`

This file is raw css.

```css
body { background-image: url('../../img/embed/will_encode.jpeg'); }
div { background-image: url('../../img/not_encode.png'); }
```

###Execute

Execute grunt-data-uri

```
% grunt dataUri
Running "dataUri:dist" (dataUri) task

SRC: 2 file uri found on sample/css/raw/main.css
>> Encode: ../../img/embed/will_encode.jpeg
>> Adjust: ../../img/not_encode.png -> ../img/not_encode.png
>> => path/to/project/sample/css/main.css

Done, without errors.
```

###After `sample/css/main.css`

This file is processed and output css.

```css
/* encoded to data-uri(base64) */
body { background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAAAQA...'); }
/* not encoded but adjust relative path! */
div { background-image: url('../img/not_encode.png'); }
```