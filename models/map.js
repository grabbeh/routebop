
var mongoose = require('mongoose')
   , mongoosastic = require('mongoosastic')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var mapSchema = new Schema({
    map: ObjectId,
    images: Array,
    formatteddate: String,
    loc: Array,
	  locTwo: Array,
    waypoints: Array,
    places: Array,
    title: {type:String, es_indexed:true},
    description: {type:String, es_indexed:true},
    markerdescs: {type:Array, es_indexed:true},
    author: String,
    date: { type: Date, default: Date.now },
    favourited: Number,
    distance: String,
    tags: {type:Array, es_indexed:true}
});

mapSchema.index({ loc: "2d"});
mapSchema.index({ locTwo: "2d"});
mapSchema.index({ tags: 1});

mapSchema.plugin(mongoosastic)

/* var Map = mongoose.model('Map', mapSchema)
  , stream = Map.synchronize()
  , count = 0;

stream.on('data', function(err, doc){
    if (err) {console.log(err)}
  count++;
});

stream.on('close', function(){
  console.log('indexed ' + count + ' documents!');
});

stream.on('error', function(err){
  console.log(err);
});*/

module.exports = mongoose.model('Map', mapSchema);

