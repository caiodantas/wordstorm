
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

module.exports = function(app, io){

	//template format
	app.set('view engine', 'html');

	//template engine
	app.engine('html', require('ejs').renderFile);

	//html
	app.set('views', __dirname + '/frontend');

	//img, css, js
	app.use(express.static(__dirname + '/resources'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(session({
	    secret: 'nodecookie',
	    resave: true,
	    saveUninitialized: true
	}));
};
