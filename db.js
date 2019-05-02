const mongoose = require('mongoose');
var dburl = 'mongodb://tanmayvij:admin123@35.196.35.2:27017/shoppinglistelectron?authSource=admin';

mongoose.connect(dburl, { useNewUrlParser: true });

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  console.log('Mongoose connected');
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

var itemSchema = new mongoose.Schema({
    'item' : String,
    'price': Number
});

mongoose.model('Item', itemSchema);