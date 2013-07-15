/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午2:26
 * @overview build to one file
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      all: {
        dest: 'Nervenet.js',
        src: [
          'src/intro.js',
          'src/core.js',
          'src/config.js',

          'src/Context.js',
          'src/utils.js',

          'src/outro.js'
        ]
      }
    },
    replace: {
      version: {
        src: ['Nervenet.js'],
        dest: 'Nervenet.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      target: {
        files: {
          'Nervenet.min.js': ['Nervenet.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

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

  grunt.registerTask('default', ['concat', 'replace', 'uglify']);
}