var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   

var userSchema = new Schema({
	
    _id: String,
    email: String,
    username: String,
    hash: String,
    favourites:  [{ type: Schema.Types.ObjectId, ref: 'Map' }],
    info: String
});

module.exports = mongoose.model('User', userSchema);