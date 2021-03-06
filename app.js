var XRegExp, app, cache, calendarId, date, express, fs, gcal, markdown, sitemap, sm;

express = require('express');

sm = require('sitemap');

markdown = require('node-markdown').Markdown;

XRegExp = require('xregexp').XRegExp;

date = require('./lib/date.coffee');

fs = require("fs");

calendarId = '6gg9b82umvrktnjsfvegq1tb24';

gcal = require('./lib/googlecalendar.coffee').GoogleCalendar(calendarId);

app = module.exports = express.createServer();

sitemap = module.exports = sm.createSitemap({
  hostname: "http://jsconf.cz",
  cacheTime: 600000,
  urls: [
    {
      url: '/meetups/',
      changefreq: 'weekly',
      priority: 0.9
    }, {
      url: '/conferences/',
      changefreq: 'monthly',
      priority: 0.3
    }
  ]
});

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

app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null) {
    return res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    return next();
  }
});

app.get('/sitemap.xml', function(req, res) {
  res.header('Content-Type', 'application/xml');
  return res.send(sitemap.toString());
});

app.get('/robots.txt', function(req, res) {
  res.header('Content-Type', 'text/plain');
  return res.send('User-Agent: *');
});

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
      var events, foo, item, parts, regex, str, talk1, talk2, talks, _i, _len, _ref, _ref1;
      if (data && data.length) {
        events = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          regex = XRegExp('Kdy:.*?(?<day>\\d{1,2})\\. (?<month>\\w+)\\.? (?<year>\\d{4})');
          parts = XRegExp.exec(item.details, regex);
          foo = date.convert(parts.year, parts.month, parts.day);
          talks = XRegExp.exec(item.details, XRegExp('Popis události: (.*)', 's'));
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
          'events': events,
          'view': 'index',
          'conferences': [markdown(str = fs.readFileSync(__dirname + '/wiki/conferences.markdown', "utf8"))]
        };
        cache.set('websiteContent', content);
      } else {
        content = {
          'events': [],
          'view': 'index',
          'conferences': [markdown(str = fs.readFileSync(__dirname + '/wiki/conferences.markdown', "utf8"))]
        };
      }
      return res.render('index', content);
    });
  }
});

app.get('/jsconf.ics', function(req, res) {
  return res.redirect(gcal.getICalUrl);
});

app.get('/meetups', function(req, res) {
  var content, str;
  str = fs.readFileSync(__dirname + '/wiki/meetups.markdown', "utf8");
  content = {
    'events': [],
    'view': 'meetups',
    'markup': [markdown(str)]
  };
  return res.render('wiki', content);
});

app.get('/conferences', function(req, res) {
  var content, str;
  str = fs.readFileSync(__dirname + '/wiki/conferences.markdown', "utf8");
  content = {
    'events': [],
    'view': 'conferences',
    'markup': [markdown(str)]
  };
  return res.render('wiki', content);
});

app.get('/404', function(req, res) {
  var content;
  content = {
    'events': [],
    'view': 'conferences'
  };
  res.status(404);
  return res.render('404', content);
});

app.listen(app.settings.port);

console.log("Express server listening in " + app.settings.env + " mode at http://localhost:" + app.settings.port + "/");
