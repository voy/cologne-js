require('coffee-script');

var XRegExp, app, cache, calendarId, date, express, gcal, markdown;

express = require('express');

markdown = require('node-markdown').Markdown;

XRegExp = require('xregexp').XRegExp;

date = require('./lib/date.coffee');

calendarId = '6gg9b82umvrktnjsfvegq1tb24';

gcal = require('./lib/googlecalendar.coffee').GoogleCalendar(calendarId);

app = module.exports = express.createServer();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  return app.use(express["static"](__dirname + '/public'));
});

app.configure('development', function() {
  app.set('cacheInSeconds', 0);
  app.set('port', 3333);
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.set('cacheInSeconds', 60 * 60);
  app.set('port', process.env.PORT || 5000);
  return app.use(express.errorHandler());
});

cache = require('./lib/pico.coffee').Pico(app.settings.cacheInSeconds);

app.get('/', function(req, res) {
  var content, gcalOptions;
  content = cache.get('websiteContent');
  if (content) {
    return res.render('index', content);
  } else {
    gcalOptions = {
      'futureevents': true,
      'orderby': 'starttime',
      'sortorder': 'ascending',
      'fields': 'items(details)',
      'max-results': 3
    };
    return gcal.getJSON(gcalOptions, function(err, data) {
      var events, foo, item, parts, regex, talk1, talk2, talks, _i, _len, _ref, _ref1;
      if (data && data.length) {
        events = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          regex = XRegExp('When:.*?(?<day>\\d{1,2})\\. (?<month>\\w+)\\.? (?<year>\\d{4})');
          parts = XRegExp.exec(item.details, regex);
          foo = date.convert(parts.year, parts.month, parts.day);
          talks = XRegExp.exec(item.details, XRegExp('Description: (.*)', 's'));
          if (talks && talks[1]) {
            _ref = talks[1].split('---'), talk1 = _ref[0], talk2 = _ref[1];
          } else {
            _ref1 = ['', ''], talk1 = _ref1[0], talk2 = _ref1[1];
          }
          events.push({
            date: date.format(foo, "%b %%o, %Y"),
            talk1: markdown(talk1),
            talk2: markdown(talk2)
          });
        }
        content = {
          'events': events
        };
        cache.set('websiteContent', content);
      } else {
        content = {
          'events': []
        };
        console.log(err);
      }
      return res.render('index', content);
    });
  }
});

app.get('/jsconf.ics', function(req, res) {
  return res.redirect(gcal.getICalUrl);
});

app.listen(app.settings.port);

console.log("Express server listening in " + app.settings.env + " mode at http://localhost:" + app.settings.port + "/");
