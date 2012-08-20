module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-coffeelint');
  // Project configuration.
  grunt.initConfig({
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
