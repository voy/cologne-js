module.exports = function(grunt) {
  // Load tasks
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-heroku-deploy');
  // Project configuration.
  grunt.initConfig({
    compass: {
      dev: {
        src: 'sass',
        dest: 'public/stylesheets',
        outputstyle: 'expanded',
        linecomments: true
      },
      prod: {
        src: 'sass',
        dest: 'public/stylesheets',
        outputstyle: 'compressed',
        linecomments: false,
        forcecompile: true
      }
    },
    watch: { // for development run 'grunt watch'
      compass: {
        files: ['sass/*.sass'],
        tasks: ['compass:dev']
      }
    },
    coffeelint: {
      one: {
        files: ['app.coffee','lib/*.coffee'],
        options: {
          indentation: {
            value: 2,
            level: "error"
          },
        }
      }
    },
    coffeelintOptions: {

    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'coffeelint');
};
