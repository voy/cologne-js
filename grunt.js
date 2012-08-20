module.exports = function(grunt) {
  // Load tasks
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-exec');
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
    coffee: {
      app: ['app.coffee','lib/*.coffee']
    },
    watch: { // for development run 'grunt watch'
      app: {
        files: ['app.coffee', 'lib/*.coffee'],
        tasks: 'coffee:app'
      },
      compass: {
        files: ['sass/*.scss'],
        tasks: ['compass:dev']
      },
      coffeescript: {
        files: ['app.coffee','lib/*.coffee'],
        tasks: ['coffeelint']
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
      max_line_length: {
        value: 100,
        level: 'error'
      }
    },
    exec: {
      deploy: {
        command: 'git push heroku master',
        stdout: true,
        stderr: true
      },
      logs: {
        command: 'heroku addons:open loggly'
      },
      run: {
        command: 'coffee app.coffee',
        stdout: true,
        stderr: true
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  // Default task.
  grunt.registerTask('default', 'watch');
};
