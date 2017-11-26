'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ChatLogSchema = new Schema({
  text:String,
  timestamp:Date,
  locaTimeStamp:Date,
  attachments: Array,
  textId: String,
  conversationId: String,
  botId: String,
  serviceURL: String,
  from: String,
  sessObj: Object,
  inputHint: String,
  userFeedback: String
},{ collection : 'maxChatLog' });

var ChatStatsSchema = new Schema({
  timeStamp:Date,
  year:String,
  month:String,
  total:Number,
  nothelpful:Number,
  noanswer: Number,
  helpful:Number
},{ collection : 'chatStats' });


module.exports = mongoose.model('chatlog', ChatLogSchema);
module.exports = mongoose.model('chatstats', ChatStatsSchema);