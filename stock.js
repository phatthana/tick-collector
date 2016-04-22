var googleFinance = require('./data-source/google-finance.js');
var investorz = require('./data-source/investorz.js');
var moment = require('moment');


function getTicks(symbol, size, callback){

  investorz.getStockHistory(symbol, size, function(err, result){
    var tickDataArray = expandData(result, symbol);
    console.log(symbol + ': ' + tickDataArray.length);
    callback(tickDataArray);
  });

  // googleFinance.getStockHistory(symbol, 50, function(err, result){
  //   if (!err){
  //     var tickDataArray = convertToTickData(result, symbol);
  //     console.log(symbol + ': ' + tickDataArray.length);
  //     callback(tickDataArray);
  //   }
  // });
}

function convertTickToArray(tickArray){
  var openArray = [];
  var closeArray = [];
  var highArray = [];
  var lowArray = [];
  var volumeArray = [];

  for (var i = 0; i < tickArray.length; i++) {
    var tick = tickArray[i];
    openArray.push(tick.open);
    closeArray.push(tick.close);
    highArray.push(tick.high);
    lowArray.push(tick.low);
    volumeArray.push(tick.volume);
  }

  var dict = {
    open: openArray,
    close: closeArray,
    high: highArray,
    low: lowArray,
    volume: volumeArray
  }
  return dict;
}

function expandData(text, symbol){
  var data = JSON.parse(text);
  if (data.s === 'ok') {
    var array = [];

    var timeArray = data.t;
    var closeArray = data.c;
    var openArray = data.o;
    var highArray = data.h;
    var lowArray = data.l;
    var volumeArray = data.v;

    for (var i = 0; i < timeArray.length; i++) {
      var time =  Number(timeArray[i]) * 1000;
      var tick = {
        'time': time,
        'symbol': symbol,
        'close': closeArray[i],
        'high': highArray[i],
        'low': lowArray[i],
        'open': openArray[i],
        'volume': volumeArray[i]
      };
      array.push(tick);
    }
    return array;
  }
  else return [];
}

function convertToTickData(text, symbol){
  var array = text.split('\n');
  var tickArray = array.slice(8,array.length-1);
  var colName = array[4].split('=')[1];
  var intervalRow = array[3];
  var columnArray = colName.split(',');
  var interval = Number(intervalRow.split('=')[1]);
  // console.log(columnArray);
  var firstColumn = tickArray[0].split(',');
  var baseTime = 0;

  var results = [];
  for (var i = 0; i < tickArray.length; i++) {
    var text = tickArray[i];
    var component = text.split(',');
    var tradeTime = Number(component[0]);

    if (isNaN(tradeTime)) {
      var timeString = component[0];
      tradeTime = Number(timeString.substring(1, timeString.length));
      baseTime = tradeTime;
    }
    else{
      tradeTime = baseTime + (tradeTime * interval);
    }
    tradeTime *= 1000;
    var utc = moment(tradeTime);
    var date = utc.format('YYYY-MM-DD HH:mm:ss');

    var tickComponent = text.split(',');
    var tickData = { 'time': tradeTime , 'symbol': symbol};
    for (var j = 1; j < columnArray.length; j++) {
      var columnName = columnArray[j];
      tickData[columnName.toLowerCase()] = tickComponent[j];
    }
    // console.log(tickData);
    results.push(tickData);
  }
  return results;
}

exports.getTicks = getTicks;
