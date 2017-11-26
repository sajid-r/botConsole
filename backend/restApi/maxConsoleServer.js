var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Task = require('./api/models/model'),
  bodyParser = require('body-parser'),
  helmet = require('helmet');

var fs = require('fs');
var https = require('https');

var useHTTPS = false;

var DBURL = 'mongodb://linux-dev-tone-ai:IcRFZuTc67ebs6A1W77Sex6HXzSTnK2Bqbf7LiL1xzMOBzslMwICwG8kCzPSImZuwpI2wgkHRa3Rd88pf2W1dg==@linux-dev-tone-ai.documents.azure.com:10255/botChatLog?ssl=true';
//var DBURL = 'mongodb://localhost:27017/knolbot';

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //res.header('X-Content-Type-Options','nosniff');
    next();
}

app.use(helmet());
app.use(allowCrossDomain);

mongoose.Promise = global.Promise;
mongoose.connect(DBURL); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app);

if(useHTTPS){
	var httpsOptions = {
	      key: fs.readFileSync('/etc/apache2/ssl/knolskape_private.key')
	        , cert: fs.readFileSync('/etc/apache2/ssl/knolskape_public.crt')
	  } 
	  https.createServer(httpsOptions, app).listen(port);
}
else{
	  const server = app.listen(port, function() {
	  console.log('RESTful API server started on: ' + port);
	});
}