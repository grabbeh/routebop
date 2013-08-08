
var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var mapSchema = new Schema({
    urltitle: {type: String, unique: true},
    date: String,
    title: String,
    body: String
});

module.exports = mongoose.model('Blog', mapSchema);

