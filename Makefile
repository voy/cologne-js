deploy:
	git push heroku master
run:
	coffee app.coffee
css:	
	compass compile
