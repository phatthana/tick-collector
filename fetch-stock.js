var moment = require('moment');
var async = require('async');

var MongoAdapter = require('./adapters/MongoAdapter.js')
var dbConfig = require('./config/dbConfig.js');

var Stock = require('./stock.js');
var symbolList = require('./stock-list.json').symbol;
// symbolList = ['AAV'];
MongoAdapter.InitDB(dbConfig, function(err, db){
  startWork();
});

function startWork(){
  console.log('start');
  async.mapSeries(symbolList, getTickData, function (err, results){
    console.log('All symbol:', symbolList.length);
    var allTicks = [];
    results.forEach(function(tickArray){

      tickArray.forEach(function(tick){
        var utc = moment(tick.time);
        var date = utc.utcOffset('+0700').format('YYYY-MM-DD');
        tick.date = date;
        allTicks.push(tick);
      });

      // allTicks.push.apply(allTicks, tickArray);
    });
    console.log('allTicks', allTicks.length);
    insertToDB(allTicks);
  });

}

function insertToDB(symbolTickArray){
    var tick1dCollection = require('./collections/Tick1dCollection.js');

    var count = 0;
    var max = symbolTickArray.length;

    var batchSize = 100;
    var nGroup = max/batchSize;
    var array = [];
    for (var i = 0; i < nGroup; i++) {
      array.push(symbolTickArray.slice(i*batchSize, (i+1)*batchSize));
    }
    async.eachSeries(array, function insert(batch, callback){
      tick1dCollection.insert(batch , function(err,result) {
        if (err) callback(err);
        else {
          count += result.insertedCount;
          console.log('add: ' + count + '/' + max);
          callback();
        }
      })
    }, function(err){
      console.log('DONE');
    });

    // async.eachSeries(symbolTickArray, function insert(tick, callback){
      // var utc = moment(tick.time);
      // var date = utc.utcOffset('+0700').format('YYYY-MM-DD');
      // tick.date = date;
    //   tick1dCollection.find({ 'symbol': tick.symbol, 'date': tick.date }).count(function(err, found){
    //
    //     if (found !== 0){
    //       console.log('found: ' + ++count + '/' + max);
    //       callback();
    //     }
    //     else {
    //       tick1dCollection.insert([ tick ], function(err,result) {
    //         if (err) callback(err);
    //         else {
    //           console.log('add: ' + ++count + '/' + max);
    //           callback();
    //         }
    //       })
    //     }
    //   });
    // }, function(err){
    //   if (err) {
    //     console.log('Insert Fail:', err);
    //   }
    //   else{
    //     console.log('Insert Done');
    //     console.log(moment().utcOffset('+0700').format());
    //   }
    //   process.exit(1);
    // });

}

function getTickData(symbol, callback){
  Stock.getTicks(symbol, '2d', function(array){
    if (array.length == 0) return callback(null, []);
    callback(null, array);
  });
}
