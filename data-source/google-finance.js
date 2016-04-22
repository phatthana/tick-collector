var request = require('request');

// '&x=BKK&i=60&p=5d&f=d,c,h,l,o,v'
var paramDay = '&x=BKK&p=10d&f=d,c,h,l,o,v';
var paramMin = '&x=BKK&i=100&p=1d&f=d,c,h,l,o,v';

function getStockHistory(symbol, size, callback){
  var unit = size.substring(size.length-1);
  var amount = size.substring(0, size.length-1);

  request('https://www.google.com/finance/getprices?q='+symbol+'&x=BKK&p=' + amount + unit + 'd&f=d,c,h,l,o,v', function (err, response, body) {
    if (err) return callback(err);
    callback(null, body);
  })
}

exports.getStockHistory = getStockHistory;
