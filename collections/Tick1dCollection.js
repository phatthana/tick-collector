var MongoAdapter = require('../adapters/MongoAdapter');
var Tick1dCollection = MongoAdapter.GetDB().collection("tick1D");

module.exports = Tick1dCollection;
