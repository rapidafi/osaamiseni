'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var distDir = 'dist';

  grunt.initConfig({
    clean: {
      files: distDir,
      options: {
        force: true
      }
    },
    useminPrepare: {
      html: ['src/index.html','src/degree.html'],
      options: {
        dest: distDir,
        flow: {
          steps: {
            'css': ['concat'],
            'js': ['concat']
          },
          post: {}
        }
      }
    },
    usemin: {
      html: [distDir+'/index.html',distDir+'/degree.html']
    },
    copy: {
      src: {
        expand: true,
        cwd: 'src',
        src: [
          './*.html',
          //usemin+concat: 'js/*',
          'demo/*',
          'css/*',
          'images/*'
        ],
        dest: distDir,
        options : {
          noProcess: '**/*.{png,gif,jpg,ico,svg}',
          process: function (content) {
            return content
              .replace(/<!--dev-->.*<!--enddev-->/g, '')
              .replace(/<!-- mustache/g, '')
              .replace(/end mustache -->/g, '');
          }
        }
      }
    }
  });

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'concat',
    'copy',
    'usemin'
  ]);
};
