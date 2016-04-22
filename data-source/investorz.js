var request = require('request');

function getStockHistory(symbol, size, callback){
  request('http://chart.investorz.com/achart/history/query.ashx?symbol='+symbol+'*BK&resolution=D&from=1451606401&to=1461334263', function (err, response, body) {
    if (err) return callback(err);
    callback(null, body);
  })
}

exports.getStockHistory = getStockHistory;
