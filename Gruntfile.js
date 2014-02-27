/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午2:26
 * @overview build to one file
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
module.exports = function (grunt) {
  var BUILD = 'nervenet.js';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      all: {
        dest: BUILD,
        src: [
          'src/intro.js',

          'src/utils.js',
          'src/core.js',
          'src/config.js',

          'src/Mediator.js',
          'src/Context.js',
          'src/Packager.js',

          'src/outro.js'
        ]
      }
    },
    replace: {
      version: {
        src: [BUILD],
        dest: BUILD
      }
    },
    uglify: {
      options: {
        report: 'gzip',
        sourceMap: 'nervenet.min.map',
        banner: '/* <%= pkg.name %> ver.<%= pkg.version %>  (c) 2013 Meathill  MIT\n build at <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %>*/ \n'
      },
      target: {
        files: {
          'nervenet.min.js': BUILD
        }
      }
    },
    qunit: {
      all: ['test/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerMultiTask('replace', 'Replace tokens', function () {
    var src = this.data.src,
        dest = this.data.dest,
        code = '',
        version = grunt.config('pkg.version');
    src.forEach(function (filepath) {
      code += grunt.file.read(filepath);
    });
    code = code.replace(/@VERSION@/g, version);

    grunt.file.write(dest, code);

    grunt.log.writeln('File "' + dest + '" replaced.');
  });

  grunt.registerTask('default', ['qunit', 'concat', 'replace', 'uglify']);
}