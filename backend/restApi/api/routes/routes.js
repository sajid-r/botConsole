'use strict';

var fs = require('fs');
var express = require("express");
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));


module.exports = function(app) {
  var controller = require('../controllers/controller');

  // controller Routes
  app.route('/conversations/:id')
    .get(controller.getConversation);

  app.route('/conversations')
    .get(controller.getConversationIds);

  app.route('/chats/:id')
    .get(controller.getChats);

  app.route('/allchats')
    .get(controller.getChatsIntegrated);

  app.route('/graph/:time')
    .get(controller.getGraphData);

  app.route('/graph/agg/:time')
    .get(controller.getGraphDataAggregated);

  app.route('/graph/agg/:time/:endDate')
    .get(controller.getGraphDataAggregatedWithEnd);

  app.route('/graph/:time/:endDate')
    .get(controller.getGraphDataWithEnd);

  app.route('/getfile')
    .post(controller.getBlobAsString);

  app.route('/graph/save/:endDate')
    .post(controller.saveAggregatedDataToDb);

  app.route('/invol/create').
  	post(controller.postInvol); //{"involvementno":10, "courseid":1,"userid":2}

}