'use strict';
var tz=require('moment-timezone'),
  json2csv = require('json2csv'),
  mongoose = require('mongoose'),
  Log = mongoose.model('chatlog'),
  moment = require('moment'),
  request = require('request'),
  Stats = mongoose.model('chatstats');

var apiURL = "http://localhost:3001"
                //////////////////
                //  RETRIEVE    //
                //////////////////

exports.getConversation = function(req,res) {
  Log.find({"conversationId":req.params.id}, function(err,item){
    if(err)
      res.send(err);
    res.json(item);
  });
};

//get IDs of conversations that have userfeedback as No or null
exports.getConversationIds = function(req,res) {
  Log.find({"userFeedback":{ $ne: "Yes"}}, {"conversationId":1, _id:0}, {limit:100}, function(err,item){
    if(err)
      res.send(err);
    res.json(item);
  });
};

exports.getChats = function(req,res) {
  Log.find({"conversationId":req.params.id}, {"conversationId":1, "text":1, "localTimeStamp":1, "textId":1, "from":1, "inputHint":1, "userFeedback":1, "attachments":1, _id:0}, function(err,item){
    if(err)
      res.send(err);
    res.json(item);
  });
}

exports.getChatsIntegrated = function(req,res) {
  Log.find({"localTimeStamp":{"$gte":new Date(moment(req.query.enddate).subtract(15,'d').toISOString()), "$lte":new Date(moment(req.query.enddate).add(1,'d').toISOString())}}, {"conversationId":1, "text":1, "localTimeStamp":1, "textId":1, "from":1, "inputHint":1, "userFeedback":1, "attachments":1, _id:0},function(err,item){
    if(err)
      res.send(err);
    res.json(item);
  });
}

exports.getGraphData = function(req,res) {

  var timediff = {"months":0,"days":0};

  if(req.params.time ==="y")
    timediff.months = 12;
  else if(req.params.time ==="m")
    timediff.months = 1;
  else if(req.params.time ==="w")
    timediff.days = 7;
  else if(req.params.time ==="d")
    timediff.days = 1;

  Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())},"inputHint":"noAnswerFound"}).count(function(err,item){
    if(err)
      res.send(err);
    var noAnswer = item;
    Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())},"userFeedback":"No"}).count(function(err,item){
      if(err)
        res.send(err);
      var no = item;
      Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())},"userFeedback":"Yes"}).count(function(err,item){
        if(err)
          res.send(err);
        var yes = item;
        Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())}}).count(function(err,item){
            if(err)
                res.send(err);
            var total = item;
            var response = {noAnswer,no,yes,total};
            res.json(response);
        });
      });
    });
  });
}

exports.getGraphDataWithEnd = function(req,res) {

  var timediff = {"months":0,"days":0};

  if(req.params.time ==="y")
    timediff.months = 12;
  else if(req.params.time ==="m")
    timediff.months = 1;
  else if(req.params.time ==="w")
    timediff.days = 7;
  else if(req.params.time ==="d")
    timediff.days = 1;

  Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).toISOString()),"$lte":new Date(moment(req.params.endDate).add(timediff.months,'M').add(timediff.days,'d').toISOString())},"inputHint":"noAnswerFound"}).count(function(err,item){
    if(err)
      res.send(err);
    var noAnswer = item;
    Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).toISOString()),"$lte":new Date(moment(req.params.endDate).add(timediff.months,'M').add(timediff.days,'d').toISOString())},"userFeedback":"No"}).count(function(err,item){
      if(err)
        res.send(err);
      var no = item;
      Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).toISOString()),"$lte":new Date(moment(req.params.endDate).add(timediff.months,'M').add(timediff.days,'d').toISOString())},"userFeedback":"Yes"}).count(function(err,item){
        if(err)
          res.send(err);
        var yes = item;
        Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).toISOString()),"$lte":new Date(moment(req.params.endDate).add(timediff.months,'M').add(timediff.days,'d').toISOString())}}).count(function(err,item){
            if(err)
                res.send(err);
            var total = item;
            var response = {noAnswer,no,yes,total};
            res.json(response);
        });
      });
    });
  });
}

exports.getGraphDataAggregated = function(req,res) {
      var timediff = {"months":0,"days":0};
      if(req.params.time ==="y")
      {
            timediff.months = 12;
            var labels = [];
            var currenttimeClone = moment();
            for(var a=0;a<12;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('MMM'));
                currenttimeClone.subtract(1,'M');
            }
          
          //get current month stats, previous month if not found then populate
          Stats.find({"timeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())}}, function(err, item){
                if(err)
                    res.send(err);
                var month=[[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]]; //NoAnswer,no,yes,total
                console.log(month[0][1]);
                for(var i=0;i<item.length;i++){
                    //console.log(item[i].noanswer);
                    month[0][i+1] = item[i].noanswer;
                    month[1][i+1] = item[i].nothelpful;
                    month[2][i+1] = item[i].helpful;
                    month[3][i+1] = item[i].total;
                }
                //console.log(month);
                var year = moment().year(), month2=moment().subtract(1,'M').month()+1;

                //  If last month data not present in the database
                if(item[item.length-1].month < moment().month()-1)
                {
                    var options = { method: 'POST',
                      url: apiURL+'/graph/save/'+year+'-'+month2+'-'+29,
                      headers: 
                       { 'postman-token': 'cc1f7e48-10a5-bf02-a19e-0110bf96d8c4',
                         'cache-control': 'no-cache' } };
                         console.log(options.url);

                    request(options, function (error, response, body) {
                      if (error) throw new Error(error);
                        month[0].push(response.noanswer);
                        month[1].push(response.nothelpful);
                        month[2].push(response.helpful);
                        month[3].push(response.total);

                        month[0].shift();
                        month[1].shift();
                        month[2].shift();
                        month[3].shift();
                    });
                }
                
                //Fetch current month's data till date
                Log.find({'localTimeStamp':{"$gte":new Date(moment().startOf('M').toISOString()),'$lte':new Date(moment().toISOString())}}, function(err,item){
                    if(err)
                        res.send(err);
                    var response=item;

                    var na=0,nh=0,h=0;
                    for(var j=0;j<response.length;j++){
                        if(response[j].inputHint === "noAnswerFound")
                            na=na+1;
                        else if(response[j].userFeedback === "No")
                            nh=nh+1;
                        else if(response[j].userFeedback === "Yes")
                            h=h+1;
                    }
                        //console.log(na,nh,h,response.length);

                        month[0].push(na);
                        month[1].push(nh);
                        month[2].push(h);
                        month[3].push(response.length);

                        month[0].shift();
                        month[1].shift();
                        month[2].shift();
                        month[3].shift();

                        res.json({month,labels});
                });
          });

      }
        
      else if(req.params.time ==="m")
      {
            timediff.months = 1;

            Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())}} ,function(err,item){
            if(err)
              res.send(err);

            var response = item;
            var week=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
            var currenttime = moment();
            var dayOfTheWeek = currenttime.day();
            var dateLimit = moment().subtract(dayOfTheWeek,'d').subtract(14,'d');
            var j=0;//start from 1st week

            var labels = [];

            var currenttimeClone = currenttime.clone();
            for(var a=0;a<4;a++){
                var sixDaysBack = currenttimeClone.clone();
                sixDaysBack.subtract(6,'d')
                labels.push(sixDaysBack.tz('Asia/Kolkata').format('MMM Do YY')+" - "+currenttimeClone.tz('Asia/Kolkata').format('MMM Do YY'));
                currenttimeClone.subtract(7,'d');
            }

            for(var i=0;i<response.length;i++)
            {
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit))
                  {
                        if(response[i].from === "User")
                            week[3][j]=week[3][j]+1;

                        if(response[i].inputHint === "noAnswerFound")
                            week[0][j]=week[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            week[1][j]=week[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            week[2][j]=week[2][j]+1;
                        
                  }
                  else
                    {
                        dateLimit=dateLimit.add(7,'d');
                        j=j+1;
                        i=i-1;
                        if(j==4)
                          break;
                    }
            }

            res.json({week,labels});
          });
      }
        
      else if(req.params.time ==="w")
      {
            timediff.days = 7;

            Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())}} ,function(err,item){
            if(err)
              res.send(err);
            //console.log(item.length);
            var dateLimit2 = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).add(1, 'day').startOf('day');
            var initialDay = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).day();
            var response = item;
            var day=[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
            var currenttime = moment();
            

            var labels = [];

            var currenttimeClone = currenttime;
            for(var a=0;a<7;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('MMM Do YY'));
                currenttimeClone.subtract(1,'d');
            }               


            var j=initialDay;//start from initial month
            j=0;
            for(var i=0;i<response.length;i++)
            {
                  //console.log(JSON.parse(JSON.stringify(response))[i].localTimeStamp+"   "+dateLimit2.toISOString());
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit2))
                  {
                        if(response[i].from === "User")
                            day[3][j]=day[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            day[0][j]=day[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            day[1][j]=day[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            day[2][j]=day[2][j]+1;
                        
                  }
                  else
                    {
                        //console.log("\n\n" + JSON.parse(JSON.stringify(response))[i].localTimeStamp);
                        dateLimit2=dateLimit2.add(1,'d');
                        j=j+1;
                        i=i-1;
                        if(j==7)
                          break;
                        //day[j]=day[j]+1;
                    }
            }

            res.json({day,labels});
          });
      }
        
      else if(req.params.time ==="d")
      {
            timediff.days = 1;

            Log.find({"localTimeStamp":{"$gte":new Date(moment().subtract(timediff.months,'M').subtract(timediff.days,'d').toISOString()),"$lte":new Date(moment().toISOString())}} ,function(err,item){
            if(err)
              res.send(err);

            var response = item;
            var hour=[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
            var currenttime = moment();
            var dateLimit = moment().subtract(23,'h');
            var j=0;//start from 1st hour

            var labels = [];

            var currenttimeClone = currenttime;
            for(var a=0;a<24;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('h a'));
                currenttimeClone.subtract(1,'h');
            }

            for(var i=0;i<response.length;i++)
            {
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit))
                  {     
                        if(response[i].from === "User")
                            hour[3][j]=hour[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            hour[0][j]=hour[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            hour[1][j]=hour[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            hour[2][j]=hour[2][j]+1;
                        
                  }
                  else
                    {
                        dateLimit=dateLimit.add(1,'h');
                        j=j+1;
                        i=i-1;
                        if(j==24)
                          break;
                    }
            }
            res.json({hour,labels});
          });
      }     
}

exports.getGraphDataAggregatedWithEnd = function(req,res) {
      var timediff = {"months":0,"days":0};
      if(req.params.time ==="y")
      {
            timediff.months = 12;

            Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).subtract(timediff.months,'M').subtract(timediff.days,'d').add(1,'d').toISOString())}} ,function(err,item){
            if(err)
              res.send(err);

            var dateLimit2 = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).add(1, 'months').startOf('month');
            var initialMonth = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).month();
            var response = item;
            var month=[[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]]; //NoAnswer,no,yes
            var currenttime = moment(req.params.endDate);
            var weekOfTheMonth = Math.ceil(currenttime.date() / 7); //extract the weekOfTheMonth
            var dayOfTheWeek = currenttime.day();
            var dateLimit = moment(req.params.endDate).subtract(dayOfTheWeek,'d').subtract((weekOfTheMonth-1)*7,'d').subtract(11,'M');
            var j=initialMonth+(12-moment(req.params.endDate).month()-1);//start from initial month and readjust index
            
            var labels = [];

            var currenttimeClone = currenttime;
            for(var a=0;a<12;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('MMM'));
                currenttimeClone.subtract(1,'M');
            }

            for(var i=0;i<response.length;i++)
            {
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit2))
                  {
                        if(response[i].from === "User")
                            month[3][j]=month[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            month[0][j]=month[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            month[1][j]=month[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            month[2][j]=month[2][j]+1;
                  }
                  else
                    {
                        //console.log("\n\n" + JSON.parse(JSON.stringify(response))[i].localTimeStamp);
                        dateLimit2=dateLimit2.add(1,'M');
                        j=j+1;
                        i=i-1;
                        if(j==12)
                          break;
                    }
            }

            res.json({month,labels});
          });
      }
        
      else if(req.params.time ==="m")
      {
            timediff.months = 1;

            Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).subtract(timediff.months,'M').subtract(timediff.days,'d').add(1,'d').toISOString())}} ,function(err,item){
            if(err)
              res.send(err);

            var response = item;
            var week=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
            var currenttime = moment(req.params.endDate);
            var dayOfTheWeek = currenttime.date();
            var dateLimit = moment(req.params.endDate).subtract(dayOfTheWeek,'d').subtract(14,'d');
            var j=0;//start from 1st week


            var labels = [];

            var currenttimeClone = currenttime.clone();

            for(var a=0;a<4;a++){
                var sixDaysBack = currenttimeClone.clone();
                sixDaysBack.subtract(6,'d')
                labels.push(sixDaysBack.tz('Asia/Kolkata').format('MMM Do YY')+" - "+currenttimeClone.tz('Asia/Kolkata').format('MMM Do YY'));
                currenttimeClone.subtract(7,'d');
            }
            

            for(var i=0;i<response.length;i++)
            {
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit))
                  {
                        if(response[i].from === "User")
                            week[3][j]=week[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            week[0][j]=week[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            week[1][j]=week[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            week[2][j]=week[2][j]+1;
                  }
                  else
                    {
                        dateLimit=dateLimit.add(7,'d');
                        j=j+1;
                        i=i-1;
                        if(j==4)
                          break;
                    }
            }

            res.json({week,labels});
          });
      }
        
      else if(req.params.time ==="w")
      {
            timediff.days = 7;

            Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).subtract(timediff.months,'M').subtract(timediff.days,'d').add(1,'d').toISOString())}} ,function(err,item){
            if(err)
              res.send(err);
            //console.log(item.length);
            var dateLimit2 = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).add(1, 'day').startOf('day');
            var initialDay = moment(JSON.parse(JSON.stringify(item))[0].localTimeStamp).day();
            var response = item;
            var day=[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
            var currenttime = moment(req.params.endDate);
            
            var labels = [];

            var currenttimeClone = currenttime;
            for(var a=0;a<7;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('dddd'));
                currenttimeClone.subtract(1,'d');
            }

            var j=initialDay;//start from initial month
            j=0;
            for(var i=0;i<response.length;i++)
            {
                  //console.log(JSON.parse(JSON.stringify(response))[i].localTimeStamp+"   "+dateLimit2.toISOString());
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit2))
                  {
                        if(response[i].from === "User")
                            day[3][j]=day[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            day[0][j]=day[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            day[1][j]=day[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            day[2][j]=day[2][j]+1;
                  }
                  else
                    {
                        //console.log("\n\n" + JSON.parse(JSON.stringify(response))[i].localTimeStamp);
                        dateLimit2=dateLimit2.add(1,'d');
                        j=j+1;
                        i=i-1;
                        if(j==7)
                          break;
                        //day[j]=day[j]+1;
                    }
            }

            res.json({day,labels});
          });
      }
        
      else if(req.params.time ==="d")
      {
            timediff.days = 1;

            Log.find({"localTimeStamp":{"$gte":new Date(moment(req.params.endDate).toISOString()),"$lte":new Date(moment(req.params.endDate).add(timediff.months,'M').add(timediff.days,'d').toISOString())}} ,function(err,item){
            if(err)
              res.send(err);

            var response = item;
            var hour=[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
            var currenttime = moment(req.params.endDate);
            //var dateLimit = moment().subtract(23,'h');
            var dateLimit = moment(req.params.endDate);
            var j=0;//start from 1st hour

            var labels = [];

            var currenttimeClone = currenttime;
            for(var a=0;a<24;a++){
                labels.push(currenttimeClone.tz('Asia/Kolkata').format('h a'));
                currenttimeClone.subtract(1,'h');
            }

            for(var i=0;i<response.length;i++)
            {
                  if(moment(JSON.parse(JSON.stringify(response))[i].localTimeStamp).isSameOrBefore(dateLimit))
                  {
                        if(response[i].from === "User")
                            hour[3][j]=hour[3][j]+1;
                        if(response[i].inputHint === "noAnswerFound")
                            hour[0][j]=hour[0][j]+1;
                        else if(response[i].userFeedback === "No")
                            hour[1][j]=hour[1][j]+1;
                        else if(response[i].userFeedback === "Yes")
                            hour[2][j]=hour[2][j]+1;
                        
                  }
                  else
                    {
                        dateLimit=dateLimit.add(1,'h');
                        j=j+1;
                        i=i-1;
                        if(j==24)
                          break;
                    }
            }
            res.json({hour,labels});
          });
      }     
}

exports.getBlobAsString = function(req,res){
    var urlRequested = req.body.url;

    var options = { 
        method: 'GET',
        url: urlRequested
      };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      //console.log(body);
      res.json(response)
    });
}

exports.saveAggregatedDataToDb = function(req,res){
    var options = { method: 'GET',
      url: apiURL+'/graph/m/'+req.params.endDate,
      headers: 
       { 'postman-token': '261e1c27-5716-5fb1-5520-e1e6f219b4cb',
         'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      //res.json(body);
      //console.log(moment(req.params.endDate));
      var query = {'month':moment(req.params.endDate).month(),'year':moment(req.params.endDate).year()};
      var timeStamp = moment(req.params.endDate).year()+'-'+(moment(req.params.endDate).month()+1)+'-'+moment(req.params.endDate).date();
      var newobj = {'timeStamp':timeStamp, 'year':moment(req.params.endDate).year(), 'month':moment(req.params.endDate).month(), 'total':JSON.parse(body).total ,'nothelpful':JSON.parse(body).no, 'noanswer':JSON.parse(body).noAnswer, 'helpful':JSON.parse(body).yes}
      Stats.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
        if(err)
          res.send(err);
        res.json(newobj);
      });
    });
}

exports.csvdata = function(req,res){
    Log.find({"localTimeStamp":{"$gte":new Date(moment(req.query.startdate).toISOString()),"$lte":new Date(moment(req.query.enddate).toISOString())}}, {"conversationId":1, "text":1, "localTimeStamp":1, "from":1, "inputHint":1, "userFeedback":1, _id:0}, function(err,item){
            if(err)
                res.send(err);
            var naTypeQueries = []
            for (var i=0; i<item.length; i++){
                if(item[i].inputHint === 'noAnswerFound'){
                    item[i-1].localTimeStamp = moment(JSON.parse(JSON.stringify(item))[i-1].localTimeStamp).tz('Asia/Kolkata').format('Do MMMM YYYY, h:mm:ss a')
                    naTypeQueries.push(item[i-1])
                }
            }
            var fields = ['localTimeStamp', 'text'];
            var fieldNames = ['Time', 'Query'];
            var data = json2csv({ data: naTypeQueries, fields: fields, fieldNames: fieldNames });

            res.attachment('filename.csv');
            res.status(200).send(data);
        });
}


                //////////////////
                //    CREATE    //
                //////////////////

exports.postUser = function(req,res) {
  console.log(req.body.body);
  var newuser = new User(JSON.parse(req.body.body));
  newuser.save(function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.postCourse = function(req,res) {
  console.log(req.body.body);
  var newcourse = new Course(JSON.parse(req.body.body));
  Course.find({}, function(err,item){
      var courses = item;
      var lastid = courses[courses.length-1].courseid;
      newcourse.courseid = lastid+1;
      newcourse.save(function(err,data){
      if(err)
        res.send(err);
      res.json(data);
    });
  });
};

exports.postAdmin = function(req,res) {
  console.log(req.body.body);
  var newadmin = new Admin(JSON.parse(req.body.body));
  newadmin.save(function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.postInvol = function(req,res) {
  console.log(req.body.body);
  var newinvol = new Invol(JSON.parse(req.body.body));
  var courseid = newinvol.courseid;
  var contentqueue = [];
  Course.find({"courseid":courseid}, function(err,item){
    if(err)
      console.log(err);
    for(var i =0; i<item[0].content.length; i++)
    {
      var timediff = item[0].content[i].timediff; //in format : {'months':11,'days':30,'hours':23,'minutes':59}
      var currenttime = moment();
      var contenttime = currenttime.clone().tz('Asia/Kolkata').add(timediff.months,'M').add(timediff.days,'d').add(timediff.hours,'h')
      .add(timediff.minutes,'m');
      console.log("Current Time is: " + contenttime.toDate());
      contentqueue.push({"contentno":item[0].content[i].contentno, "time":contenttime.toDate()});
    }
    newinvol.messageQueue = contentqueue;
    newinvol.save(function(err,data)
    {
      if(err)
        res.send(err);
      res.json(data);
    });
  });
};

                //////////////////
                //    UPDATE    //
                //////////////////


exports.updateUser = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {'userid':queryid.userid};
  var newobj = JSON.parse(req.body.body);
  User.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.updateAdmin = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {'adminid':queryid.adminid};
  var newobj = JSON.parse(req.body.body);
  Admin.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.updateCourse = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {'courseid':queryid.courseid};
  var newobj = JSON.parse(req.body.body);
  Course.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.insertContent = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {"courseid":queryid.courseid};
  //console.log("Query = " + query + "queryid.courseid = " + queryid.courseid);
  var desc = queryid.contentdesc;
  var url = queryid.link;
  var newcontent = {"contentdesc":desc,"link":queryid.link, "imgurl":queryid.imgurl, "timediff":queryid.timediff};
  Course.update(query,{$push: {"content":newcontent}},{upsert:true},function(err,data){
        if(err){
                res.send(err);
        }else{
                res.json(data);
        }
});
}

exports.updateInvol = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {'involvementno':queryid.involvementno};
  var newobj = JSON.parse(req.body.body);
  Invol.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};

exports.updateInvolUsingObjID = function(req,res) {
  console.log(req.body.body);
  var queryid = JSON.parse(req.body.body);
  var query = {'_id':queryid._id};
  var newobj = JSON.parse(req.body.body);
  Invol.findOneAndUpdate(query, newobj, {upsert:true},function(err,data){
    if(err)
      res.send(err);
    res.json(data);
  });
};