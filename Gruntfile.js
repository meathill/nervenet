/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午2:26
 * @overview build to one file
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
module.exports = function () {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    }
  })
}